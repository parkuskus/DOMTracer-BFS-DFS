// =============================================================================
// main.go — HTTP API server yang menghubungkan parser + selector + traversal
// =============================================================================
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"github.com/parkuskus/Tubes2_nama_kelompok/src/traversal"
)

// ---------------------------------------------------------------------------
// Structs untuk request & response HTTP
// ---------------------------------------------------------------------------

// traverseRequest adalah body JSON yang dikirim dari frontend.
type traverseRequest struct {
	Input       string `json:"input"`       // URL atau raw HTML string
	InputMode   string `json:"inputMode"`   // "url" atau "html"
	Algorithm   string `json:"algorithm"`   // "BFS" atau "DFS"
	CSSSelector string `json:"cssSelector"` // CSS selector, e.g. "div.container"
	Limit       int    `json:"limit"`       // 0 = semua, N = top-N
}

// traverseResponse adalah response JSON yang dikirim ke frontend.
// Shape ini harus cocok persis dengan interface ApiResponse di types.ts.
type traverseResponse struct {
	Tree         *treeNodeJSON  `json:"tree"`
	TraversalLog []logEntryJSON `json:"traversalLog"`
	Metrics      metricsJSON    `json:"metrics"`
	Algorithm    string         `json:"algorithm"`
	Selector     string         `json:"selector"`
}

// treeNodeJSON merepresentasikan satu node DOM untuk dikirim ke frontend.
// Ini adalah versi yang sudah dianotasi (isTraversed, isMatched, nodeId).
type treeNodeJSON struct {
	Tag        string            `json:"tag"`
	Text       string            `json:"text,omitempty"`
	Attributes map[string]string `json:"attributes"`
	Children   []*treeNodeJSON   `json:"children"`
	Depth      int               `json:"depth"`
	IsTraversed bool             `json:"isTraversed"`
	IsMatched   bool             `json:"isMatched"`
	NodeID      string           `json:"nodeId"`
}

// logEntryJSON adalah satu langkah traversal untuk ditampilkan di TraversalLog.tsx
type logEntryJSON struct {
	Step    int    `json:"step"`
	NodeTag string `json:"nodeTag"`
	NodeID  string `json:"nodeId"`
	Message string `json:"message"`
	IsMatch bool   `json:"isMatch"`
}

// metricsJSON adalah metrik performa untuk ditampilkan di MetricsPanel.tsx
type metricsJSON struct {
	SearchTimeMs     float64 `json:"searchTimeMs"`
	VisitedNodeCount int     `json:"visitedNodeCount"`
	MatchedNodeCount int     `json:"matchedNodeCount"`
	MaxDepth         int     `json:"maxDepth"`
}

// errorResponse adalah format error yang konsisten.
type errorResponse struct {
	Error string `json:"error"`
}

// ---------------------------------------------------------------------------
// main — entry point, daftarkan routes dan jalankan server
// ---------------------------------------------------------------------------

func main() {
	mux := http.NewServeMux()

	// Endpoint utama traversal
	mux.HandleFunc("/api/traverse", withCORS(handleTraverse))

	// Health check — berguna untuk debugging koneksi
	mux.HandleFunc("/api/health", withCORS(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	}))

	port := "8080"
	log.Printf("🚀 DOMTracer API server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

// ---------------------------------------------------------------------------
// handleTraverse — handler utama POST /api/traverse
// ---------------------------------------------------------------------------

func handleTraverse(w http.ResponseWriter, r *http.Request) {
	// Hanya terima POST
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "only POST is allowed")
		return
	}

	// Decode request body JSON
	var req traverseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body: "+err.Error())
		return
	}

	// Validasi input
	if strings.TrimSpace(req.Input) == "" {
		writeError(w, http.StatusBadRequest, "field 'input' cannot be empty")
		return
	}
	if strings.TrimSpace(req.CSSSelector) == "" {
		writeError(w, http.StatusBadRequest, "field 'cssSelector' cannot be empty")
		return
	}

	// ── Step 1: Parse HTML menjadi pohon DOM ─────────────────────────────
	var root *parser.Node
	var err error

	switch strings.ToLower(req.InputMode) {
	case "html":
		// Input adalah raw HTML string langsung
		root, err = parser.ParseHTML(req.Input)
	default:
		// Default: input adalah URL, lakukan scraping
		root, err = parser.HTMLScraper(req.Input)
	}

	if err != nil {
		writeError(w, http.StatusBadGateway, "failed to parse/fetch HTML: "+err.Error())
		return
	}

	// ── Step 2: Jalankan traversal BFS/DFS ────────────────────────────────
	searchReq := traversal.SearchRequest{
		Selector:            req.CSSSelector,
		Algorithm:           req.Algorithm,
		Limit:               req.Limit,
		IncludeTraversalLog: true,  // selalu include log untuk UI
		IncludePathToMatch:  false,
	}

	result, err := traversal.SearchDOM(root, searchReq)
	if err != nil {
		writeError(w, http.StatusBadRequest, "traversal error: "+err.Error())
		return
	}

	// ── Step 3: Anotasi pohon dengan isTraversed & isMatched ─────────────
	// Buat set nodePath dari hasil traversal dan match untuk lookup O(1)
	traversedPaths := make(map[string]bool, result.VisitedCount)
	for _, event := range result.TraversalLog {
		traversedPaths[event.NodePath] = true
	}

	matchedPaths := make(map[string]bool, len(result.Matches))
	for _, hit := range result.Matches {
		matchedPaths[hit.NodePath] = true
	}

	// Konversi pohon parser.Node → treeNodeJSON secara rekursif
	annotatedTree := annotateTree(root, "0", traversedPaths, matchedPaths)

	// ── Step 4: Konversi TraversalLog ke format frontend ─────────────────
	logEntries := make([]logEntryJSON, 0, len(result.TraversalLog))
	for _, event := range result.TraversalLog {
		msg := fmt.Sprintf("Visiting <%s> at depth %d (path: %s)", event.Tag, event.Depth, event.NodePath)
		if event.Matched {
			msg = fmt.Sprintf("✦ MATCH: <%s> at depth %d matches selector", event.Tag, event.Depth)
		}
		logEntries = append(logEntries, logEntryJSON{
			Step:    event.Step,
			NodeTag: event.Tag,
			NodeID:  event.NodePath,
			Message: msg,
			IsMatch: event.Matched,
		})
	}

	// ── Step 5: Hitung max depth pohon keseluruhan ────────────────────────
	maxDepth := calcMaxDepth(root)

	// ── Step 6: Kirim response ────────────────────────────────────────────
	resp := traverseResponse{
		Tree:         annotatedTree,
		TraversalLog: logEntries,
		Metrics: metricsJSON{
			SearchTimeMs:     float64(result.DurationMs),
			VisitedNodeCount: result.VisitedCount,
			MatchedNodeCount: len(result.Matches),
			MaxDepth:         maxDepth,
		},
		Algorithm: result.AlgorithmUsed,
		Selector:  result.SelectorUsed,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// ---------------------------------------------------------------------------
// Helper: annotateTree — konversi parser.Node → treeNodeJSON secara rekursif
// ---------------------------------------------------------------------------

func annotateTree(n *parser.Node, path string, traversed, matched map[string]bool) *treeNodeJSON {
	if n == nil {
		return nil
	}

	node := &treeNodeJSON{
		Tag:         n.Tag,
		Text:        n.Text,
		Attributes:  n.Attributes,
		Children:    make([]*treeNodeJSON, 0, len(n.Children)),
		Depth:       n.Depth,
		IsTraversed: traversed[path],
		IsMatched:   matched[path],
		NodeID:      path,
	}

	// Pastikan Attributes tidak nil agar JSON serialization konsisten
	if node.Attributes == nil {
		node.Attributes = map[string]string{}
	}

	// Rekursif untuk setiap child
	for i, child := range n.Children {
		childPath := fmt.Sprintf("%s/%d", path, i)
		node.Children = append(node.Children, annotateTree(child, childPath, traversed, matched))
	}

	return node
}

// ---------------------------------------------------------------------------
// Helper: calcMaxDepth — hitung kedalaman maksimum pohon DOM secara rekursif
// ---------------------------------------------------------------------------

func calcMaxDepth(n *parser.Node) int {
	if n == nil {
		return 0
	}
	max := n.Depth
	for _, child := range n.Children {
		if d := calcMaxDepth(child); d > max {
			max = d
		}
	}
	return max
}

// ---------------------------------------------------------------------------
// Helper: withCORS — middleware CORS agar frontend bisa akses backend
// ---------------------------------------------------------------------------

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Izinkan request dari frontend dev server (port 5173)
		// Ganti dengan domain production jika sudah deploy
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight request dari browser
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

// ---------------------------------------------------------------------------
// Helper: writeError — tulis JSON error dengan status code
// ---------------------------------------------------------------------------

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(errorResponse{Error: msg})
}