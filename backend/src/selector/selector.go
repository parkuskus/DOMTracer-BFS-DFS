package selector

import (
	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
	"strings"
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
	// parent node until root of the defining style property

	if idx := strings.Index(selector, " > "); idx != -1 {
		left := strings.TrimSpace(selector[:idx])
		right := strings.TrimSpace(selector[idx+3:])
		return MatchSelector(node, right) && node.Parent != nil && Match(node.Parent, left)
	}
	// single step parental node
	if idx := strings.Index(selector, " + "); idx != -1 {
		left := strings.TrimSpace(selector[:idx])
		right := strings.TrimSpace(selector[idx+3:])
		if !MatchSelector(node, right) {
			return false
		}

		prev := prevElementSibling(node)
		return prev != nil && Match(prev, left)
	}

	if idx := strings.Index(selector, " ~ "); idx != -1 {
		left := strings.TrimSpace(selector[:idx])
		right := strings.TrimSpace(selector[idx+3:])

		if !MatchSelector(node, right) {
			return false
		}
		return hasPrevSibling(node, left)
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
