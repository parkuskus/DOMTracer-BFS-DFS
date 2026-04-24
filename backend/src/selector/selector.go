package selector

import (
	"strings"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
)

func MatchSelector(n *parser.Node, selector string) bool {
	if selector == "*" {
		return true
	}

	if strings.HasPrefix(selector, "#") {
		return n.Attributes["id"] == selector[1:]
	}

	if strings.HasPrefix(selector, ".") {
		classes := strings.Fields(n.Attributes["class"])
		for _, class := range classes {
			if class == selector[1:] {
				return true
			}
		}
		return false
	}

	return n.Tag == selector

}

/*
notation:
left: left-hand-side of the operand
right: right-hand-side of the operand
*/
func Match(node *parser.Node, selector string) bool {
	selector = strings.ReplaceAll(selector, ">", " > ")
	selector = strings.ReplaceAll(selector, "+", " + ")
	selector = strings.ReplaceAll(selector, "~", " ~ ")

	selector = strings.Join(strings.Fields(selector), " ")

	if left, combinator, right, ok := splitLastCombinator(selector); ok {
		switch combinator {
		case ">":
			return MatchSelector(node, right) && node.Parent != nil && Match(node.Parent, left)
		case "+":
			if !MatchSelector(node, right) {
				return false
			}

			prev := prevElementSibling(node)
			return prev != nil && Match(prev, left)
		case "~":
			if !MatchSelector(node, right) {
				return false
			}
			return hasPrevSibling(node, left)
		}
	}

	parts := strings.Fields(selector)
	if len(parts) > 1 {

		hasCombinator := false
		for _, p := range parts {
			if p == ">" || p == "+" || p == "~" {
				hasCombinator = true
				break
			}
		}
		if !hasCombinator {
			right := parts[len(parts)-1]
			left := strings.Join(parts[:len(parts)-1], " ")
			if !MatchSelector(node, right) {
				return false
			}

			return hasAncestor(node, left)
		}
	}
	return MatchSelector(node, selector)
}

func splitLastCombinator(selector string) (left string, combinator string, right string, ok bool) {
	parts := strings.Fields(selector)
	for i := len(parts) - 1; i >= 0; i-- {
		switch parts[i] {
		case ">", "+", "~":
			if i == 0 || i == len(parts)-1 {
				return "", "", "", false
			}
			left = strings.Join(parts[:i], " ")
			combinator = parts[i]
			right = strings.Join(parts[i+1:], " ")
			return left, combinator, right, true
		}
	}
	return "", "", "", false
}

// finding sibling
func prevElementSibling(node *parser.Node) *parser.Node {
	if node.Parent == nil {
		return nil
	}

	var prev *parser.Node
	for _, child := range node.Parent.Children {
		if child == node {
			return prev
		}
		prev = child
	}
	return nil
}

func hasPrevSibling(node *parser.Node, selector string) bool {
	if node.Parent == nil {
		return false
	}

	for _, child := range node.Parent.Children {
		if child == node {
			return false
		}
		if Match(child, selector) {
			return true
		}
	}
	return false
}

func hasAncestor(node *parser.Node, selector string) bool {
	current := node.Parent
	for current != nil {
		if Match(current, selector) {
			return true
		}
		current = current.Parent
	}
	return false
}
