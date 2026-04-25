# DOMTracer

![DOMTracer](docs/public/dom.png)

DOMTracer adalah aplikasi visualisasi penelusuran DOM berbasis algoritma BFS dan DFS untuk pencarian elemen menggunakan CSS selector. Aplikasi ini terdiri dari backend Go untuk parsing + traversal DOM serta frontend React untuk visualisasi tree, metrik, dan traversal log.

## Deskripsi Program

Program menerima input HTML (URL atau raw HTML), melakukan parsing menjadi pohon DOM, lalu menjalankan pencarian node berdasarkan CSS selector. Hasil ditampilkan dalam bentuk:

- Tree graph
- Daftar traversal langkah demi langkah
- Metrik performa (waktu pencarian, jumlah node dikunjungi, jumlah match, kedalaman)

## Struktur Project

```text
.
|- backend/
|  |- cmd/server/           # Entry point backend server
|  |- src/parser/           # HTML parser & scraper
|  |- src/selector/         # CSS selector matcher
|  |- src/traversal/        # BFS/DFS traversal engine
|  |- Dockerfile
|  |- go.mod
|  \- Makefile
|- frontend/
|  |- src/                 # App bootstrap, api client, types
|  |- components/          # UI components
|  |- pages/               # Route pages
|  |- Dockerfile
|  \- package.json
|- docs/
|  |- public/              # Asset gambar dokumentasi
|  \- ...
|- test/                   # Test cases HTML + expected outputs
|- docker-compose.yml
|- LICENSE
\- README.md
```

## Fitur Yang Tersedia

- Parsing HTML menjadi pohon DOM.
- Pencarian selector dengan algoritma BFS atau DFS.
- Dukungan combinator selector:
    - Descendant: `a b`
    - Child: `a > b`
    - Adjacent sibling: `a + b`
    - General sibling: `a ~ b`
- Dukungan simple selector:
    - Tag: `div`
    - Class: `.container`
    - ID: `#header`
    - Universal: `*`
    - Tag + class: `div.container`
    - Multi-class: `.c1.c2`
    - Attribute: `[x=y]`, `a[x=y]`, `[attr]`
- Dukungan query kompleks dengan multiple combinator, contoh: `div.container > ul.menu > li#item1[x=y]`.
- Visualisasi hasil traversal dan node yang match.
- Opsi limit hasil (Top-N).

## Penjelasan Singkat Algoritma BFS dan DFS

- BFS (Breadth-First Search): menelusuri node per tingkat (level-order). Semua node pada depth yang sama diperiksa terlebih dahulu sebelum turun ke depth berikutnya.
- DFS (Depth-First Search): menelusuri sedalam mungkin pada satu cabang, kemudian backtrack ke cabang lain.

Pada implementasi ini, kedua algoritma mengevaluasi selector di setiap node yang dikunjungi. Perbedaan utama ada pada urutan kunjungan node, sehingga urutan match bisa berbeda walau jumlah match total biasanya sama.

## Requirements

- Go 1.22+ (untuk backend)
- Node.js 18+ dan npm (untuk frontend)
- Docker + Docker Compose (opsional, jika menjalankan via container)

## How To Run

### Menggunakan Docker

Jalankan dari root project:

```bash
docker compose up --build
```

Akses aplikasi di:

- Frontend: http://localhost
- Backend API: http://localhost:8080

Stop container:

```bash
docker compose down
```

## Format Input File

Input file berupa dokumen HTML valid (`.html` / `.htm`).

Contoh file input:

```html
<!DOCTYPE html>
<html>
    <body>
        <div class="container main" data-role="app">
            <ul class="menu primary">
                <li id="home" data-kind="nav">Home</li>
                <li data-kind="nav">About</li>
            </ul>
            <ol>
                <li id="ordered">Ordered</li>
            </ol>
        </div>
    </body>
</html>
```

Contoh query selector kompleks untuk pengujian.

```css
div.container.main[data-role=app] > ul.menu.primary > li#home[data-kind=nav]
```

## Testing

Jalankan seluruh unit test

```bash
go test ./... -v
```

Dokumentasi endpoint backend dan contoh penggunaannya ada di [docs/api.md](docs/api.md).

## Anggota Kelompok

- Moh. Hafizh Irham Perdana (13524025)
- Aufa Rienaldifaza Ahmad (13524027)
- Muhammad Aufar Rizqi Kusuma (13524061)

## License

Project ini menggunakan lisensi MIT. Detail lengkap terdapat pada file [LICENSE](LICENSE).
