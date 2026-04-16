package traversal

import (
	"fmt"
	"strings"
	"time"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"github.com/parkuskus/Tubes2_nama_kelompok/src/selector"
)

const (
	AlgorithmBFS = "BFS"
	AlgorithmDFS = "DFS"
)

type SearchRequest struct {
	Selector            string
	Algorithm           string
	Limit               int
	IncludeTraversalLog bool
	IncludePathToMatch  bool
}

type SearchResult struct {
	Matches         []MatchHit   `json:"matches"`
	VisitedCount    int          `json:"visitedCount"`
	MaxDepthVisited int          `json:"maxDepthVisited"`
	DurationMs      int64        `json:"durationMs"`
	TraversalLog    []VisitEvent `json:"traversalLog,omitempty"`
	StoppedByLimit  bool         `json:"stoppedByLimit"`
	AlgorithmUsed   string       `json:"algorithmUsed"`
	SelectorUsed    string       `json:"selectorUsed"`
}

type MatchHit struct {
	NodePath     string            `json:"nodePath"`
	Tag          string            `json:"tag"`
	Attributes   map[string]string `json:"attributes,omitempty"`
	TextSnippet  string            `json:"textSnippet,omitempty"`
	Depth        int               `json:"depth"`
	VisitStep    int               `json:"visitStep"`
	PathFromRoot []string          `json:"pathFromRoot,omitempty"`
}

type VisitEvent struct {
	Step       int    `json:"step"`
	NodePath   string `json:"nodePath"`
	Tag        string `json:"tag"`
	Depth      int    `json:"depth"`
	Matched    bool   `json:"matched"`
	ParentPath string `json:"parentPath,omitempty"`
}

type queueItem struct {
	node        *parser.Node
	nodePath    string
	parentPath  string
	pathFromTop []string
}

// SearchDOM is the single entry point for selector search over a DOM tree.
func SearchDOM(root *parser.Node, req SearchRequest) (SearchResult, error) {
	if root == nil {
		return SearchResult{}, fmt.Errorf("root cannot be nil")
	}

	if strings.TrimSpace(req.Selector) == "" {
		return SearchResult{}, fmt.Errorf("selector cannot be empty")
	}

	algo := strings.ToUpper(strings.TrimSpace(req.Algorithm))
	// Default to BFS if algorithm is omitted.
	if algo == "" {
		algo = AlgorithmBFS
	}

	switch algo {
	case AlgorithmBFS:
		res := searchBFS(root, req)
		res.AlgorithmUsed = algo
		res.SelectorUsed = req.Selector
		return res, nil
	case AlgorithmDFS:
		res := searchDFS(root, req)
		res.AlgorithmUsed = algo
		res.SelectorUsed = req.Selector
		return res, nil
	default:
		return SearchResult{}, fmt.Errorf("unsupported algorithm %q, use BFS or DFS", req.Algorithm)
	}
}

// searchBFS walks the DOM breadth-first and collects matches plus optional logs.
func searchBFS(root *parser.Node, req SearchRequest) SearchResult {
	start := time.Now()
	res := SearchResult{
		Matches:      make([]MatchHit, 0),
		TraversalLog: make([]VisitEvent, 0),
	}

	queue := []queueItem{{
		node:        root,
		nodePath:    "0",
		parentPath:  "",
		pathFromTop: []string{root.Tag},
	}}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		_, shouldStop := processVisit(&res, current, req)
		if shouldStop {
			break
		}

		// BFS expands children in natural order so traversal is level by level.
		for i, child := range current.node.Children {
			childPath := fmt.Sprintf("%s/%d", current.nodePath, i)
			childRoute := append(cloneStringSlice(current.pathFromTop), child.Tag)
			queue = append(queue, queueItem{
				node:        child,
				nodePath:    childPath,
				parentPath:  current.nodePath,
				pathFromTop: childRoute,
			})
		}
	}

	res.DurationMs = time.Since(start).Milliseconds()
	return res
}

// searchDFS walks the DOM depth-first and keeps left-to-right sibling order.
func searchDFS(root *parser.Node, req SearchRequest) SearchResult {
	start := time.Now()
	res := SearchResult{
		Matches:      make([]MatchHit, 0),
		TraversalLog: make([]VisitEvent, 0),
	}

	stack := []queueItem{{
		node:        root,
		nodePath:    "0",
		parentPath:  "",
		pathFromTop: []string{root.Tag},
	}}

	for len(stack) > 0 {
		top := len(stack) - 1
		current := stack[top]
		stack = stack[:top]

		_, shouldStop := processVisit(&res, current, req)
		if shouldStop {
			break
		}

		// Push children in reverse so pop order still visits left-to-right.
		for i := len(current.node.Children) - 1; i >= 0; i-- {
			child := current.node.Children[i]
			childPath := fmt.Sprintf("%s/%d", current.nodePath, i)
			childRoute := append(cloneStringSlice(current.pathFromTop), child.Tag)
			stack = append(stack, queueItem{
				node:        child,
				nodePath:    childPath,
				parentPath:  current.nodePath,
				pathFromTop: childRoute,
			})
		}
	}

	res.DurationMs = time.Since(start).Milliseconds()
	return res
}

// processVisit updates visit stats, checks selector match, and handles early stop.
func processVisit(res *SearchResult, current queueItem, req SearchRequest) (matched bool, shouldStop bool) {
	res.VisitedCount++

	if current.node.Depth > res.MaxDepthVisited {
		res.MaxDepthVisited = current.node.Depth
	}

	// Selector matching is delegated to selector package so traversal stays generic.
	matched = selector.Match(current.node, req.Selector)
	if matched {
		hit := MatchHit{
			NodePath:    current.nodePath,
			Tag:         current.node.Tag,
			Attributes:  cloneAttrs(current.node.Attributes),
			TextSnippet: normalizeSnippet(current.node.Text),
			Depth:       current.node.Depth,
			VisitStep:   res.VisitedCount,
		}
		if req.IncludePathToMatch {
			hit.PathFromRoot = cloneStringSlice(current.pathFromTop)
		}
		res.Matches = append(res.Matches, hit)
	}

	if req.IncludeTraversalLog {
		res.TraversalLog = append(res.TraversalLog, buildVisitEvent(res.VisitedCount, current, matched))
	}

	// Stop early when Top-N limit is reached.
	if req.Limit > 0 && len(res.Matches) >= req.Limit {
		res.StoppedByLimit = true
		return matched, true
	}

	return matched, false
}

// buildVisitEvent converts traversal state into a serializable log entry.
func buildVisitEvent(step int, current queueItem, matched bool) VisitEvent {
	return VisitEvent{
		Step:       step,
		NodePath:   current.nodePath,
		Tag:        current.node.Tag,
		Depth:      current.node.Depth,
		Matched:    matched,
		ParentPath: current.parentPath,
	}
}

// normalizeSnippet trims and caps node text so results stay compact.
func normalizeSnippet(raw string) string {
	// Keep snippets compact for UI and logs.
	compact := strings.Join(strings.Fields(strings.TrimSpace(raw)), " ")
	if len(compact) > 120 {
		return compact[:117] + "..."
	}
	return compact
}

func cloneAttrs(attrs map[string]string) map[string]string {
	// Return a copied map so stored results are isolated from future node mutations.
	if len(attrs) == 0 {
		return nil
	}

	copied := make(map[string]string, len(attrs))
	for key, value := range attrs {
		copied[key] = value
	}
	return copied
}

func cloneStringSlice(values []string) []string {
	// Keep path slices immutable once attached into result payloads.
	if len(values) == 0 {
		return nil
	}

	copied := make([]string, len(values))
	copy(copied, values)
	return copied
}
