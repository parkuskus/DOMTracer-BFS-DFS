package selector

import (
	"strings"

	"github.com/parkuskus/Tubes2_nama_kelompok/src/parser"
)

func MatchSelector(n *parser.Node, selector string) bool {
	selector = strings.TrimSpace(selector)
	if selector == "" {
		return false
	}

	if selector == "*" {
		return true
	}

	tag, rest := parseLeadingTag(selector)
	if tag != "" && n.Tag != tag {
		return false
	}

	for len(rest) > 0 {
		switch rest[0] {
		case '#':
			ident, next, ok := parseIdentifier(rest[1:])
			if !ok {
				return false
			}
			if n.Attributes["id"] != ident {
				return false
			}
			rest = next
		case '.':
			className, next, ok := parseIdentifier(rest[1:])
			if !ok {
				return false
			}
			if !hasClass(n, className) {
				return false
			}
			rest = next
		case '[':
			consumed, ok := matchAttributeSelector(n, rest)
			if !ok {
				return false
			}
			rest = rest[consumed:]
		default:
			return false
		}
	}

	return true

}

func parseLeadingTag(selector string) (tag string, rest string) {
	if selector == "" {
		return "", ""
	}

	for i, r := range selector {
		switch r {
		case '.', '#', '[':
			if i == 0 {
				return "", selector
			}
			return selector[:i], selector[i:]
		}
	}

	return selector, ""
}

func parseIdentifier(value string) (ident string, next string, ok bool) {
	if value == "" {
		return "", "", false
	}

	end := len(value)
	for i, r := range value {
		switch r {
		case '.', '#', '[':
			end = i
			goto done
		}
	}

done:
	ident = strings.TrimSpace(value[:end])
	if ident == "" {
		return "", "", false
	}
	if end == len(value) {
		return ident, "", true
	}
	return ident, value[end:], true
}

func hasClass(n *parser.Node, className string) bool {
	classes := strings.Fields(n.Attributes["class"])
	for _, class := range classes {
		if class == className {
			return true
		}
	}
	return false
}

func matchAttributeSelector(n *parser.Node, rest string) (consumed int, ok bool) {
	end := strings.Index(rest, "]")
	if end == -1 {
		return 0, false
	}

	body := strings.TrimSpace(rest[1:end])
	if body == "" {
		return 0, false
	}

	if !strings.Contains(body, "=") {
		_, exists := n.Attributes[body]
		return end + 1, exists
	}

	parts := strings.SplitN(body, "=", 2)
	attrName := strings.TrimSpace(parts[0])
	attrValue := strings.TrimSpace(parts[1])
	attrValue = strings.Trim(attrValue, "\"'")
	if attrName == "" {
		return 0, false
	}

	return end + 1, n.Attributes[attrName] == attrValue

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
