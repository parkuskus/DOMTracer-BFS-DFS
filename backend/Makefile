.PHONY: run build tidy

tidy:
	go mod tidy

run:
	go run ./cmd/server/main.go

build:
	go build -o bin/server ./cmd/server/main.go

dev:
	go run -race ./cmd/server/main.go
