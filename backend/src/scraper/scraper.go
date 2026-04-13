package scraper

import (
	"fmt"
	"github.com/gocolly/colly"
)

func HTMLScraper(url string) {
	c := colly.NewCollector()

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Scraping", r.URL)
	})

	c.OnResponse(func(r *colly.Response) {
		fmt.Println("status: ", r.StatusCode)
	})

	c.OnError(func(r *colly.Response, err error) {
		fmt.Println("Request URL: ", r.Request.URL, "Failed with response: ", r, "\nError: ", err)
	})

	err := c.Visit(url)
	if err != nil {
		fmt.Println("error: ", err)
	}

}
