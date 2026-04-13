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
