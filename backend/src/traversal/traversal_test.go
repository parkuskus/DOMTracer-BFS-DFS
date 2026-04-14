package traversal

import (
	"testing"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
)

func TestSearchDOMBFSOrder(t *testing.T) {
	root := sampleTree()

	res, err := SearchDOM(root, SearchRequest{
		Selector:            "*",
		Algorithm:           AlgorithmBFS,
		Limit:               0,
		IncludeTraversalLog: true,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if res.VisitedCount != 6 {
		t.Fatalf("expected visited 6, got %d", res.VisitedCount)
	}

	gotOrder := tagsFromEvents(res.TraversalLog)
	wantOrder := []string{"html", "body", "footer", "article", "section", "small"}
	assertStringSliceEqual(t, gotOrder, wantOrder)
}

func TestSearchDOMDFSOrder(t *testing.T) {
	root := sampleTree()

	res, err := SearchDOM(root, SearchRequest{
		Selector:            "*",
		Algorithm:           AlgorithmDFS,
		Limit:               0,
		IncludeTraversalLog: true,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if res.VisitedCount != 6 {
		t.Fatalf("expected visited 6, got %d", res.VisitedCount)
	}

	gotOrder := tagsFromEvents(res.TraversalLog)
	wantOrder := []string{"html", "body", "article", "section", "footer", "small"}
	assertStringSliceEqual(t, gotOrder, wantOrder)
}

func TestSearchDOMLimitAndPath(t *testing.T) {
	root := sampleTree()

	res, err := SearchDOM(root, SearchRequest{
		Selector:           ".hit",
		Algorithm:          AlgorithmBFS,
		Limit:              1,
		IncludePathToMatch: true,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(res.Matches) != 1 {
		t.Fatalf("expected 1 match, got %d", len(res.Matches))
	}

	if !res.StoppedByLimit {
		t.Fatalf("expected StoppedByLimit true")
	}

	if res.Matches[0].Tag != "article" {
		t.Fatalf("expected first match tag article, got %s", res.Matches[0].Tag)
	}

	wantPath := []string{"html", "body", "article"}
	assertStringSliceEqual(t, res.Matches[0].PathFromRoot, wantPath)
}

func TestSearchDOMInvalidInput(t *testing.T) {
	root := sampleTree()

	_, err := SearchDOM(root, SearchRequest{Selector: "", Algorithm: AlgorithmBFS})
	if err == nil {
		t.Fatalf("expected error for empty selector")
	}

	_, err = SearchDOM(root, SearchRequest{Selector: "*", Algorithm: "RANDOM"})
	if err == nil {
		t.Fatalf("expected error for invalid algorithm")
	}

	_, err = SearchDOM(nil, SearchRequest{Selector: "*", Algorithm: AlgorithmBFS})
	if err == nil {
		t.Fatalf("expected error for nil root")
	}
}

func sampleTree() *parser.Node {
	root := &parser.Node{Tag: "html", Depth: 0, Attributes: map[string]string{}}
	body := &parser.Node{Tag: "body", Depth: 1, Parent: root, Attributes: map[string]string{}}
	footer := &parser.Node{Tag: "footer", Depth: 1, Parent: root, Attributes: map[string]string{}}
	article := &parser.Node{Tag: "article", Depth: 2, Parent: body, Attributes: map[string]string{"class": "hit"}}
	section := &parser.Node{Tag: "section", Depth: 2, Parent: body, Attributes: map[string]string{"class": "hit"}}
	small := &parser.Node{Tag: "small", Depth: 2, Parent: footer, Attributes: map[string]string{}}

	root.Children = []*parser.Node{body, footer}
	body.Children = []*parser.Node{article, section}
	footer.Children = []*parser.Node{small}

	return root
}

func tagsFromEvents(events []VisitEvent) []string {
	out := make([]string, 0, len(events))
	for _, event := range events {
		out = append(out, event.Tag)
	}
	return out
}

func assertStringSliceEqual(t *testing.T, got, want []string) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("slice length mismatch: got %d, want %d", len(got), len(want))
	}
	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("slice mismatch at index %d: got %s, want %s", i, got[i], want[i])
		}
	}
}
