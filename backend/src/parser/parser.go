package parser

import (
	"fmt"
	"golang.org/x/net/html"
	"net/http"
	"time"
)

type Node struct {
	Tag        string            `json:"tag"`
	Text       string            `json:"text, omitempty"`
	Attributes map[string]string `json:"attributes, omitempty"`
	Parent     *Node             `json:"parent, omitempty"`
	Children   []*Node           `json:"children, omitempty"`
	Depth      int               `json:"depth, omitempty"`
}

func HTMLScraper(url string) (*Node, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// request creation
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create req: %w", err)
	}
	// bypass most webs protection
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	res, err := client.Do(req)

	if err != nil {
		fmt.Println("Error fetching URL: ", err)
		return nil, fmt.Errorf("Failed to fetch URL: %w", err)
	}
	defer res.Body.Close()
	doc, err := html.Parse(res.Body)

	if err != nil {
		fmt.Println("Error parsing HTML: ", err)
		return nil, fmt.Errorf("Failed to parse HTML: %w", err)
	}

	parseTree := traverse(doc)

	return parseTree, nil
}

func traverse(n *html.Node) *Node {

	// we traverse through the first child, and build tree from root
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if c.Type == html.ElementNode {
			return buildTree(c, nil, 0)
		}
	}
	return nil
}

func buildTree(n *html.Node, parent *Node, depth int) *Node {
	if n.Type != html.ElementNode {
		return nil
	}

	node := &Node{
		Tag:        n.Data,
		Attributes: extractAttrs(n.Attr),
		Parent:     parent,
		Depth:      depth,
	}

	// build tree  recursively from nextsibling
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		child := buildTree(c, node, depth+1)
		if child != nil {
			node.Children = append(node.Children, child)
		}
	}
	return node
}

// extract all attributes
func extractAttrs(attrs []html.Attribute) map[string]string {
	result := make(map[string]string)
	for _, attr := range attrs {
		result[attr.Key] = attr.Val
	}
	return result
}
