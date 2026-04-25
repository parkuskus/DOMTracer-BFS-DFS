package selector

import (
	"testing"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
)

func TestMatchesSimple(t *testing.T) {
	node := &parser.Node{
		Tag: "div",
		Attributes: map[string]string{
			"class": "box container c1 c2",
			"id":    "header",
			"x":     "y",
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
		{"div.container", true},
		{".c1.c2", true},
		{"div.c1.c2#header", true},
		{"div[x=y]", true},
		{"[x=y]", true},
		{"[x=z]", false},
		{"[class]", true},
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

func TestMatchesSelectorChainedCombinators(t *testing.T) {
	container := &parser.Node{Tag: "div", Attributes: map[string]string{"class": "container"}}
	ul := &parser.Node{Tag: "ul", Attributes: map[string]string{"class": "c1 c2"}, Parent: container}
	ol := &parser.Node{Tag: "ol", Parent: container}
	li1 := &parser.Node{Tag: "li", Attributes: map[string]string{"x": "y", "id": "id1"}, Parent: ul}
	li2 := &parser.Node{Tag: "li", Parent: ol}
	container.Children = []*parser.Node{ul, ol}
	ul.Children = []*parser.Node{li1}
	ol.Children = []*parser.Node{li2}

	if !Match(li1, ".container > ul > li") {
		t.Fatal("expected chained child selector to match li inside .container > ul")
	}

	if Match(li2, ".container > ul > li") {
		t.Fatal("expected li inside ol to not match .container > ul > li")
	}

	if !Match(li1, "div > ul > li") {
		t.Fatal("expected chained child selector without class to match")
	}

	if !Match(li1, ".container > ul.c1.c2 > li#id1[x=y]") {
		t.Fatal("expected chained selector with tag+class+id+attribute to match")
	}

	if Match(li2, ".container > ul.c1.c2 > li#id1[x=y]") {
		t.Fatal("expected non-matching li to fail for chained selector with simple-selector combinations")
	}
}
