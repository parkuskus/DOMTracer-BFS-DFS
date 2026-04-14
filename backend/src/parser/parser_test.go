package parser

import (
	"fmt"
	"testing"
)

func printTree(node *Node, indent string, depth int) {
	if node == nil {
		return
	}

	if node.Depth > depth {
		return
	}
	fmt.Printf("%s<%s> depth=%d attrs=%v\n", indent, node.Tag, node.Depth, node.Attributes)
	for _, child := range node.Children {
		printTree(child, indent+"  ", depth)
	}
}

func TestHTMLScraperWikipedia(t *testing.T) {
	root, err := HTMLScraper("https://books.toscrape.com/")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if root == nil {
		t.Fatal("expected a tree, got nil")
	}

	printTree(root, "", 3)
}
