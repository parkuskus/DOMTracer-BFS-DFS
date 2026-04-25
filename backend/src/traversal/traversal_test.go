package traversal

import (
	"os"
	"testing"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
)

// shared scraped tree — fetched once, reused across all integration tests
func scrapedTree(t *testing.T) *parser.Node {
	t.Helper()
	root, err := parser.HTMLScraper("https://books.toscrape.com/")
	if err != nil {
		t.Fatalf("failed to scrape books.toscrape.com: %v", err)
	}
	if root == nil {
		t.Fatal("scraper returned nil root")
	}
	return root
}

func TestLocal_MultiClassSelector_Case15(t *testing.T) {
	raw, err := os.ReadFile("../../../test/cases/case_15.html")
	if err != nil {
		t.Fatalf("failed to read case_15.html: %v", err)
	}

	root, err := parser.ParseHTML(string(raw))
	if err != nil {
		t.Fatalf("failed to parse case_15.html: %v", err)
	}

	res, err := SearchDOM(root, SearchRequest{
		Selector:  ".highlight.btn",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) != 2 {
		t.Fatalf("expected 2 .highlight.btn matches, got %d", len(res.Matches))
	}

	got := []string{res.Matches[0].Tag, res.Matches[1].Tag}
	want := []string{"div", "span"}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("match %d tag = %q, want %q", i, got[i], want[i])
		}
	}
}

// --- TAG SELECTOR ---

// <article> tags wrap each book card — there are exactly 20 per page
func TestIntegration_TagSelector_Article(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  "article",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 20 books per page = 20 article elements
	if len(res.Matches) != 20 {
		t.Errorf("expected 20 article matches, got %d", len(res.Matches))
	}
	t.Logf("article matches: %d, visited: %d, duration: %dms", len(res.Matches), res.VisitedCount, res.DurationMs)
}

// <li> tags are used in the category sidebar — should be many
func TestIntegration_TagSelector_Li(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  "li",
		Algorithm: AlgorithmDFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) == 0 {
		t.Error("expected li matches, got 0")
	}
	t.Logf("li matches: %d", len(res.Matches))
}

// --- CLASS SELECTOR ---

// .product_pod wraps each book card alongside article
func TestIntegration_ClassSelector_ProductPod(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  ".product_pod",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) != 20 {
		t.Errorf("expected 20 .product_pod matches, got %d", len(res.Matches))
	}
	t.Logf(".product_pod matches: %d", len(res.Matches))
}

// .nav-list is the sidebar category navigation
func TestIntegration_ClassSelector_NavList(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  ".nav-list",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) == 0 {
		t.Error("expected at least one .nav-list match")
	}
	t.Logf(".nav-list matches: %d", len(res.Matches))
}

// --- UNIVERSAL SELECTOR ---

// * matches every element — should be a large number
func TestIntegration_UniversalSelector(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  "*",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// a real HTML page has hundreds of nodes
	if res.VisitedCount < 100 {
		t.Errorf("expected > 100 nodes visited, got %d", res.VisitedCount)
	}
	// every visited node matches *
	if len(res.Matches) != res.VisitedCount {
		t.Errorf("expected all visited nodes to match *, got %d matches vs %d visited", len(res.Matches), res.VisitedCount)
	}
	t.Logf("total nodes: %d", res.VisitedCount)
}

// --- LIMIT / TOP-N ---

// top 5 article elements using BFS
func TestIntegration_TopN_BFS(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:  "article",
		Algorithm: AlgorithmBFS,
		Limit:     5,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) != 5 {
		t.Errorf("expected 5 matches with limit 5, got %d", len(res.Matches))
	}
	if !res.StoppedByLimit {
		t.Error("expected StoppedByLimit to be true")
	}
	t.Logf("top 5 articles found after visiting %d nodes", res.VisitedCount)
}

// --- BFS VS DFS SAME RESULTS ---

// both algorithms should find the same total matches, just in different order
func TestIntegration_BFSvsDFS_SameMatchCount(t *testing.T) {
	root := scrapedTree(t)

	bfsRes, err := SearchDOM(root, SearchRequest{
		Selector:  ".product_pod",
		Algorithm: AlgorithmBFS,
	})
	if err != nil {
		t.Fatalf("BFS error: %v", err)
	}

	dfsRes, err := SearchDOM(root, SearchRequest{
		Selector:  ".product_pod",
		Algorithm: AlgorithmDFS,
	})
	if err != nil {
		t.Fatalf("DFS error: %v", err)
	}

	if len(bfsRes.Matches) != len(dfsRes.Matches) {
		t.Errorf("BFS found %d matches, DFS found %d — should be equal", len(bfsRes.Matches), len(dfsRes.Matches))
	}
	t.Logf("BFS visited %d nodes in %dms, DFS visited %d nodes in %dms",
		bfsRes.VisitedCount, bfsRes.DurationMs,
		dfsRes.VisitedCount, dfsRes.DurationMs)
}

// --- TRAVERSAL LOG ---

// verify traversal log is populated when requested
func TestIntegration_TraversalLog(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:            "article",
		Algorithm:           AlgorithmBFS,
		Limit:               3,
		IncludeTraversalLog: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.TraversalLog) == 0 {
		t.Error("expected traversal log to be non-empty")
	}

	// log should have more entries than matches (visited > matched)
	if len(res.TraversalLog) <= len(res.Matches) {
		t.Errorf("expected log entries (%d) > matches (%d)", len(res.TraversalLog), len(res.Matches))
	}
	t.Logf("log entries: %d, matches: %d", len(res.TraversalLog), len(res.Matches))
}

// --- PATH TO MATCH ---

// path from root to first article should go through html > body > ...
func TestIntegration_PathToMatch(t *testing.T) {
	root := scrapedTree(t)

	res, err := SearchDOM(root, SearchRequest{
		Selector:           "article",
		Algorithm:          AlgorithmBFS,
		Limit:              1,
		IncludePathToMatch: true,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res.Matches) == 0 {
		t.Fatal("expected at least one match")
	}

	path := res.Matches[0].PathFromRoot
	if len(path) == 0 {
		t.Fatal("expected non-empty path from root")
	}

	// path must start at html and end at article
	if path[0] != "html" {
		t.Errorf("expected path to start with 'html', got '%s'", path[0])
	}
	if path[len(path)-1] != "article" {
		t.Errorf("expected path to end with 'article', got '%s'", path[len(path)-1])
	}
	t.Logf("path to first article: %v", path)
}
