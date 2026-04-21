package parser

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"golang.org/x/net/html"
)

type Node struct {
	Tag        string            `json:"tag"`
	Text       string            `json:"text,omitempty"`
	Attributes map[string]string `json:"attributes,omitempty"`
	Parent     *Node             `json:"parent,omitempty"`
	Children   []*Node           `json:"children,omitempty"`
	Depth      int               `json:"depth,omitempty"`
}

var selfClosingTags = map[string]bool{
	"area": true, "base": true, "br": true, "col": true,
	"embed": true, "hr": true, "img": true, "input": true,
	"link": true, "meta": true, "param": true, "source": true,
	"track": true, "wbr": true,
}

func HTMLScraper(url string) (*Node, error) {
	raw, err := FetchHTML(url)
	if err != nil {
		fmt.Println("Error parsing HTML: ", err)
		return nil, fmt.Errorf("Failed to parse HTML: %w", err)
	}

	root, err := ParseHTML(raw)
	if err != nil {
		return nil, err
	}

	return root, nil
}

// Fetch the plain text from GET request
func FetchHTML(url string) (string, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create req: %w", err)
	}
	// bypass most webs protection
	req.Header.Set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

	res, err := client.Do(req)

	if err != nil {
		fmt.Println("Error fetching URL: ", err)
		return "", fmt.Errorf("Failed to fetch URL: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status: %w", err)
	}

	bytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("Failed to read body: %w", err)
	}
	return string(bytes), nil
}

// Parses the HTML tree
func ParseHTML(raw string) (*Node, error) {
	tokenizer := html.NewTokenizer(strings.NewReader(raw))

	root := &Node{Tag: "document", Depth: -1}
	// stack for parent children operations
	stack := []*Node{root}

	for {
		tokenType := tokenizer.Next()
		// TODO: switch to hardcoded values IF not allowed by asisten
		switch tokenType {
		case html.ErrorToken:
			err := tokenizer.Err()
			if err == io.EOF {
				if len(root.Children) > 0 {
					return root.Children[0], nil
				}
				return nil, fmt.Errorf("empty document")
			}
		case html.StartTagToken:
			name, hasAttr := tokenizer.TagName()
			tag := string(name)

			node := &Node{
				Tag:        tag,
				Attributes: extractAttrsFromTokenizer(tokenizer, hasAttr),
				Parent:     stack[len(stack)-1],
				Depth:      len(stack) - 1,
			}
			parent := stack[len(stack)-1]
			parent.Children = append(parent.Children, node)

			if !selfClosingTags[tag] {
				stack = append(stack, node)
			}
		case html.TextToken:
			text := strings.TrimSpace(string(tokenizer.Text()))
			if text != "" {
				parent := stack[len(stack)-1]
				parent.Text = text
			}
		case html.EndTagToken:
			name, _ := tokenizer.TagName()
			tag := string(name)

			for len(stack) > 1 {
				top := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				if top.Tag == tag {
					break
				}
			}
		case html.SelfClosingTagToken:
			name, hasAttr := tokenizer.TagName()
			tag := string(name)

			node := &Node{
				Tag:        tag,
				Attributes: extractAttrsFromTokenizer(tokenizer, hasAttr),
				Parent:     stack[len(stack)-1],
				Depth:      len(stack) - 1,
			}
			parent := stack[len(stack)-1]
			parent.Children = append(parent.Children, node)

		}
	}

}

func extractAttrsFromTokenizer(t *html.Tokenizer, hasAttr bool) map[string]string {
	attrs := make(map[string]string)
	if !hasAttr {
		return attrs
	}
	for {
		key, val, more := t.TagAttr()
		attrs[string(key)] = string(val)
		if !more {
			break
		}
	}

	return attrs
}
