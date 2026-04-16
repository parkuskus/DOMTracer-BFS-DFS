package selector

import (
	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"testing"
)

func TestMatchesSimple(t *testing.T) {
	node := &parser.Node{
		Tag: "div",
		Attributes: map[string]string{
			"class": "box container",
			"id":    "header",
		},
	}

	cases := []struct {
		selector string
		expected bool
	}{
		{"div", true},
		{"p", false},
		{"*", true},
		{".box", true},
		{".container", true},
		{".missing", false},
		{"#header", true},
		{"#footer", false},
	}

	for _, c := range cases {
		result := MatchSelector(node, c.selector)
		if result != c.expected {
			t.Errorf("matchesSimple(%q) = %v, want %v", c.selector, result, c.expected)
		}
	}
}
func TestMatchesSelector(t *testing.T) {
	div := &parser.Node{Tag: "div"}
	p := &parser.Node{Tag: "p", Parent: div}
	span := &parser.Node{Tag: "span", Attributes: map[string]string{"class": "box"}, Parent: p}
	div.Children = []*parser.Node{p}
	p.Children = []*parser.Node{span}

	cases := []struct {
		node     *parser.Node
		selector string
		expected bool
	}{
		{span, "span", true},
		{span, ".box", true},
		{p, "div > p", true},
		{span, "div > span", false},
		{p, "div p", true},
		{span, "div span", true},
		{span, "p > span", true},
		{span, "p + span", false},
	}

	for _, c := range cases {
		result := Match(c.node, c.selector)
		if result != c.expected {
			t.Errorf("matchesSelector(%s, %q) = %v, want %v", c.node.Tag, c.selector, result, c.expected)
		}
	}
}
