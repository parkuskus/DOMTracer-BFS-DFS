# Tubes2_nama_kelompok


# Tech Stack 
| Task | Language | Libraries |
| ---- | -------- | --------- |
| Web Scraping | Golang | colly (harusnya boleh) | 
| Frontend | Typescript + Tailwindcss | UI libs only (shadcn, etc.) | 
| Backend | Golang | Gin | 


# Testing 
Try to read the ./backend/src/parser/parser_test.go 

it's better to do unit testing using *testing go package. We could do testing without making a main.go. Compilation is as simple as 

``` bash 
go test ./... -v #for verbose 
```
