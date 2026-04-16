package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"github.com/parkuskus/Tubes2_nama_kelompok/src/traversal"
)

type ScrapeRequest struct {
	URL       string `json:"url"`
	Selector  string `json:"selector"`
	Algorithm string `json:"algorithm"`
	Limit     int    `json:"limit"`

	IncludeTraversalLog bool `json:"includeTraversalLog"`
	IncludePathToMatch  bool `json:"includePathToMatch"`
}

type ScrapeResponse struct {
	OK      bool                    `json:"ok"`
	Error   string                  `json:"error"`
	Result  *traversal.SearchResult `json:"result,omitempty"`
	FetchMs int64                   `json:"fetchMs,omitempty"`
}

type TreeResponse struct {
	OK    bool         `json:"ok"`
	Error string       `json:"error,omitempty"`
	Tree  *parser.Node `json:"tree,omitempty"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next(w, r)
	}
}

// fetch -> dom -> selector search -> return match

func handleScrape(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, ScrapeResponse{Error: "POST only"})
		return
	}

	var req ScrapeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, ScrapeResponse{Error: "invalid JSON: " + err.Error()})
		return
	}

	req.URL = strings.TrimSpace(req.URL)
	req.Selector = strings.TrimSpace(req.Selector)

	// defaults

	if req.URL == "" {
		writeJSON(w, http.StatusBadRequest, ScrapeResponse{Error: "url is required"})
		return
	}
	if req.Selector == "" {
		writeJSON(w, http.StatusBadRequest, ScrapeResponse{Error: "selector is required"})
		return
	}
	if req.Algorithm == "" {
		req.Algorithm = "BFS"
	}

	t0 := time.Now()
	root, err := parser.HTMLScraper(req.URL)
	fetchMs := time.Since(t0).Milliseconds()
	if err != nil {
		writeJSON(w, http.StatusBadGateway, ScrapeResponse{Error: "fetch/parse failed: " + err.Error()})
		return
	}

	result, err := traversal.SearchDOM(root, traversal.SearchRequest{
		Selector:            req.Selector,
		Algorithm:           strings.ToUpper(req.Algorithm),
		Limit:               req.Limit,
		IncludeTraversalLog: req.IncludeTraversalLog,
		IncludePathToMatch:  req.IncludePathToMatch,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, ScrapeResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, ScrapeResponse{
		OK:      true,
		Result:  &result,
		FetchMs: fetchMs,
	})

}

func handleTree(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, TreeResponse{Error: "POST only"})
		return
	}

	var body struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, TreeResponse{Error: "invalid JSON"})
		return
	}
	body.URL = strings.TrimSpace(body.URL)
	if body.URL == "" {
		writeJSON(w, http.StatusBadRequest, TreeResponse{Error: "url is required"})
		return
	}

	root, err := parser.HTMLScraper(body.URL)
	if err != nil {
		writeJSON(w, http.StatusBadGateway, TreeResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, TreeResponse{OK: true, Tree: root})
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "time": time.Now().Format(time.RFC3339)})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/scrape", cors(handleScrape))
	mux.HandleFunc("/api/tree", cors(handleTree))
	mux.HandleFunc("/api/health", cors(handleHealth))

	mux.Handle("/", http.FileServer(http.Dir("./static")))

	addr := ":8080"
	fmt.Printf("server listening on http://localhost%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
