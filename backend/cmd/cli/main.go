package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"github.com/parkuskus/Tubes2_nama_kelompok/src/traversal"
)

type traversalLogPayload struct {
	GeneratedAt string                 `json:"generatedAt"`
	Algorithm   string                 `json:"algorithm"`
	Selector    string                 `json:"selector"`
	Visited     int                    `json:"visited"`
	DurationMs  int64                  `json:"durationMs"`
	Events      []traversal.VisitEvent `json:"events"`
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Println("=== DOM Traversal CLI ===")
	fmt.Println("Pipeline: HTML -> DOM -> BFS/DFS + CSS Selector")
	fmt.Println()

	root, source, fetchMs, parseMs, err := buildDOMFromInput(reader)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	selector := promptRequired(reader, "Masukkan CSS selector", "")
	algorithm := promptAlgorithm(reader)
	limit := promptLimit(reader)
	includePath := promptYesNo(reader, "Sertakan path dari root ke node match? (y/n)", false)
	includeLog := promptYesNo(reader, "Simpan traversal log? (y/n)", true)

	searchResult, err := traversal.SearchDOM(root, traversal.SearchRequest{
		Selector:            selector,
		Algorithm:           algorithm,
		Limit:               limit,
		IncludeTraversalLog: includeLog,
		IncludePathToMatch:  includePath,
	})
	if err != nil {
		fmt.Printf("Error search: %v\n", err)
		os.Exit(1)
	}

	printSummary(source, selector, searchResult, fetchMs, parseMs)
	printMatches(searchResult.Matches)

	if includeLog {
		path, saveErr := saveTraversalLog(searchResult)
		if saveErr != nil {
			fmt.Printf("Gagal menyimpan traversal log: %v\n", saveErr)
		} else {
			fmt.Printf("Traversal log tersimpan di: %s\n", path)
		}
	}
}

func buildDOMFromInput(reader *bufio.Reader) (root *parser.Node, source string, fetchMs int64, parseMs int64, err error) {
	mode := promptChoice(reader,
		"Pilih sumber input HTML", []string{"1) URL website", "2) HTML manual", "3) File HTML"}, "1")

	switch mode {
	case "1":
		url := promptRequired(reader, "Masukkan URL", "")

		fetchStart := time.Now()
		raw, fetchErr := parser.FetchHTML(url)
		fetchMs = time.Since(fetchStart).Milliseconds()
		if fetchErr != nil {
			return nil, "", 0, 0, fmt.Errorf("fetch gagal: %w", fetchErr)
		}

		parseStart := time.Now()
		root, err = parser.ParseHTML(raw)
		parseMs = time.Since(parseStart).Milliseconds()
		if err != nil {
			return nil, "", fetchMs, parseMs, fmt.Errorf("parse gagal: %w", err)
		}
		return root, "URL", fetchMs, parseMs, nil
	case "2":
		raw := promptMultilineHTML(reader)
		parseStart := time.Now()
		root, err = parser.ParseHTML(raw)
		parseMs = time.Since(parseStart).Milliseconds()
		if err != nil {
			return nil, "", 0, parseMs, fmt.Errorf("parse gagal: %w", err)
		}
		return root, "HTML manual", 0, parseMs, nil
	case "3":
		htmlPath := promptRequired(reader, "Masukkan path file HTML", "../test/cases/case01_basic_article.html")

		raw, readErr := os.ReadFile(htmlPath)
		if readErr != nil {
			return nil, "", 0, 0, fmt.Errorf("gagal membaca file %q: %w", htmlPath, readErr)
		}

		parseStart := time.Now()
		root, err = parser.ParseHTML(string(raw))
		parseMs = time.Since(parseStart).Milliseconds()
		if err != nil {
			return nil, "", 0, parseMs, fmt.Errorf("parse gagal: %w", err)
		}
		return root, "File: " + htmlPath, 0, parseMs, nil
	default:
		return nil, "", 0, 0, fmt.Errorf("mode input tidak valid")
	}
}

func promptRequired(reader *bufio.Reader, label string, defaultValue string) string {
	for {
		input := readLine(reader, label, defaultValue)
		if strings.TrimSpace(input) != "" {
			return strings.TrimSpace(input)
		}
		fmt.Println("Input tidak boleh kosong.")
	}
}

func promptAlgorithm(reader *bufio.Reader) string {
	for {
		algo := strings.ToUpper(readLine(reader, "Pilih algoritma [BFS/DFS]", "BFS"))
		if algo == traversal.AlgorithmBFS || algo == traversal.AlgorithmDFS {
			return algo
		}
		fmt.Println("Algoritma hanya boleh BFS atau DFS.")
	}
}

func promptLimit(reader *bufio.Reader) int {
	mode := promptChoice(reader,
		"Jumlah hasil", []string{"1) Semua kemunculan", "2) Top-N"}, "1")

	if mode == "1" {
		return 0
	}

	for {
		raw := readLine(reader, "Masukkan nilai N (N > 0)", "10")
		n, err := strconv.Atoi(strings.TrimSpace(raw))
		if err == nil && n > 0 {
			return n
		}
		fmt.Println("N harus bilangan bulat positif.")
	}
}

func promptChoice(reader *bufio.Reader, title string, options []string, defaultValue string) string {
	fmt.Println(title)
	for _, option := range options {
		fmt.Println(option)
	}
	allowed := make(map[string]bool, len(options))
	for i := range options {
		allowed[strconv.Itoa(i+1)] = true
	}

	for {
		value := strings.TrimSpace(readLine(reader, "Pilihan", defaultValue))
		if value == "" {
			value = defaultValue
		}
		if allowed[value] {
			return value
		}
		fmt.Println("Pilihan tidak valid.")
	}
}

func promptYesNo(reader *bufio.Reader, label string, defaultYes bool) bool {
	defaultValue := "n"
	if defaultYes {
		defaultValue = "y"
	}

	for {
		value := strings.ToLower(strings.TrimSpace(readLine(reader, label, defaultValue)))
		if value == "" {
			value = defaultValue
		}
		if value == "y" || value == "yes" {
			return true
		}
		if value == "n" || value == "no" {
			return false
		}
		fmt.Println("Masukkan y atau n.")
	}
}

func promptMultilineHTML(reader *bufio.Reader) string {
	fmt.Println("Tempel HTML manual. Ketik END pada baris baru untuk selesai.")
	lines := make([]string, 0)
	for {
		line, _ := reader.ReadString('\n')
		line = strings.TrimRight(line, "\r\n")
		if strings.EqualFold(strings.TrimSpace(line), "END") {
			break
		}
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n")
}

func readLine(reader *bufio.Reader, label string, defaultValue string) string {
	if defaultValue != "" {
		fmt.Printf("%s [%s] (default): ", label, defaultValue)
	} else {
		fmt.Printf("%s: ", label)
	}
	text, _ := reader.ReadString('\n')
	text = strings.TrimSpace(text)
	if text == "" {
		return defaultValue
	}
	return text
}

func printSummary(source, selector string, result traversal.SearchResult, fetchMs, parseMs int64) {
	total := fetchMs + parseMs + result.DurationMs

	fmt.Println()
	fmt.Println("=== Ringkasan ===")
	fmt.Printf("Sumber HTML      : %s\n", source)
	fmt.Printf("Selector         : %s\n", selector)
	fmt.Printf("Algoritma        : %s\n", result.AlgorithmUsed)
	fmt.Printf("Total Match      : %d\n", len(result.Matches))
	fmt.Printf("Visited Node     : %d\n", result.VisitedCount)
	fmt.Printf("Max Depth        : %d\n", result.MaxDepthVisited)
	fmt.Printf("Fetch Time (ms)  : %d\n", fetchMs)
	fmt.Printf("Parse Time (ms)  : %d\n", parseMs)
	fmt.Printf("Search Time (ms) : %d\n", result.DurationMs)
	fmt.Printf("Pipeline Time(ms): %d\n", total)
	if result.StoppedByLimit {
		fmt.Println("Status           : berhenti karena limit Top-N")
	}
}

func printMatches(matches []traversal.MatchHit) {
	fmt.Println()
	fmt.Println("=== Hasil Match ===")
	if len(matches) == 0 {
		fmt.Println("Tidak ada node yang cocok.")
		return
	}

	for i, hit := range matches {
		fmt.Printf("%d) tag=%s depth=%d step=%d path=%s\n", i+1, hit.Tag, hit.Depth, hit.VisitStep, hit.NodePath)
		if len(hit.Attributes) > 0 {
			fmt.Printf("   attrs: %v\n", hit.Attributes)
		}
		if hit.TextSnippet != "" {
			fmt.Printf("   text : %s\n", hit.TextSnippet)
		}
		if len(hit.PathFromRoot) > 0 {
			fmt.Printf("   route: %s\n", strings.Join(hit.PathFromRoot, " > "))
		}
	}
}

func saveTraversalLog(result traversal.SearchResult) (string, error) {
	if len(result.TraversalLog) == 0 {
		return "", fmt.Errorf("traversal log kosong (aktifkan IncludeTraversalLog dan pastikan traversal berjalan)")
	}

	payload := traversalLogPayload{
		GeneratedAt: time.Now().Format(time.RFC3339),
		Algorithm:   result.AlgorithmUsed,
		Selector:    result.SelectorUsed,
		Visited:     result.VisitedCount,
		DurationMs:  result.DurationMs,
		Events:      result.TraversalLog,
	}

	if err := os.MkdirAll("logs", 0o755); err != nil {
		return "", err
	}

	filename := fmt.Sprintf("traversal_log_%s.json", time.Now().Format("20060102_150405"))
	path := filepath.Join("logs", filename)

	content, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return "", err
	}

	if err := os.WriteFile(path, content, 0o644); err != nil {
		return "", err
	}

	return path, nil
}
