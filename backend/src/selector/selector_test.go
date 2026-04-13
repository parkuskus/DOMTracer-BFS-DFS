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
