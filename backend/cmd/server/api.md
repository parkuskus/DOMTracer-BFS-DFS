# API Documentation

Dokumentasi ini menjelaskan endpoint backend yang tersedia untuk scraping HTML, parsing DOM, dan traversal selector.

## Base URL

Secara default server berjalan di:

```text
http://localhost:8080
```

## Konvensi Umum

- Semua endpoint API memakai JSON kecuali endpoint upload file yang memakai `multipart/form-data`.
- Semua endpoint mendukung CORS dan `OPTIONS` untuk preflight.
- Response sukses umumnya memakai field `ok: true`.
- Jika terjadi error, response berisi `ok: false` dan `error`.

## 1. GET /api/health

Endpoint health check untuk memastikan server aktif.

### Request

Tidak ada body.

### Response

```json
{
  "status": "ok",
  "time": "2026-04-20T12:34:56Z"
}
```

### Contoh penggunaan

```bash
curl http://localhost:8080/api/health
```

## 2. POST /api/tree

Mengambil HTML dari URL lalu mengembalikan tree DOM hasil parsing.

### Request body

```json
{
  "url": "https://example.com"
}
```

### Response sukses

```json
{
  "ok": true,
  "tree": {
    "tag": "html",
    "children": []
  }
}
```

### Error umum

- `url is required`
- `invalid JSON`
- `Failed to fetch URL: ...`

### Contoh penggunaan

```bash
curl -X POST http://localhost:8080/api/tree \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## 3. POST /api/scrape

Mengambil HTML dari URL, mem-parsing DOM, lalu menjalankan traversal selector.

### Request body

```json
{
  "url": "https://example.com",
  "selector": "a",
  "algorithm": "BFS",
  "limit": 10,
  "includeTraversalLog": true,
  "includePathToMatch": true
}
```

### Field request

- `url`: wajib, URL target yang akan di-scrape.
- `selector`: wajib, CSS selector untuk pencarian.
- `algorithm`: opsional, `BFS` atau `DFS`. Default `BFS`.
- `limit`: opsional, batas jumlah match yang dikembalikan. `0` berarti tanpa batas.
- `includeTraversalLog`: opsional, `true`/`false` untuk menyertakan log traversal.
- `includePathToMatch`: opsional, `true`/`false` untuk menyertakan path dari root ke node match.

### Response sukses

```json
{
  "ok": true,
  "result": {
    "matches": [],
    "visitedCount": 0,
    "maxDepthVisited": 0,
    "durationMs": 0,
    "traversalLog": [],
    "stoppedByLimit": false,
    "algorithmUsed": "BFS",
    "selectorUsed": "a"
  },
  "fetchMs": 123
}
```

### Struktur `result`

- `matches`: daftar node yang cocok.
- `visitedCount`: jumlah node yang dikunjungi.
- `maxDepthVisited`: kedalaman maksimum yang sempat dikunjungi.
- `durationMs`: waktu traversal.
- `traversalLog`: log langkah traversal, jika diminta.
- `stoppedByLimit`: `true` jika traversal berhenti karena limit.
- `algorithmUsed`: algoritma yang dipakai.
- `selectorUsed`: selector yang dipakai.

### Contoh penggunaan

```bash
curl -X POST http://localhost:8080/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": "a",
    "algorithm": "DFS",
    "limit": 5,
    "includeTraversalLog": true,
    "includePathToMatch": true
  }'
```

## 4. POST /api/tree-upload

Mengirim file HTML dari user lalu mengembalikan tree hasil parsing.

### Content-Type

`multipart/form-data`

### Field form-data

- `file`: wajib, file HTML yang di-upload.

### Response sukses

```json
{
  "ok": true,
  "tree": {
    "tag": "html",
    "children": []
  }
}
```

### Contoh penggunaan

```bash
curl -X POST http://localhost:8080/api/tree-upload \
  -F "file=@sample.html"
```

## 5. POST /api/scrape-upload

Mengirim file HTML dari user lalu menjalankan traversal selector terhadap isi file tersebut.

### Content-Type

`multipart/form-data`

### Field form-data

- `file`: wajib, file HTML yang di-upload.
- `selector`: wajib, CSS selector.
- `algorithm`: opsional, `BFS` atau `DFS`. Default `BFS`.
- `limit`: opsional, integer.
- `includeTraversalLog`: opsional, `true`/`false`.
- `includePathToMatch`: opsional, `true`/`false`.

### Response sukses

```json
{
  "ok": true,
  "result": {
    "matches": [],
    "visitedCount": 0,
    "maxDepthVisited": 0,
    "durationMs": 0,
    "traversalLog": [],
    "stoppedByLimit": false,
    "algorithmUsed": "BFS",
    "selectorUsed": "div.content a"
  },
  "fetchMs": 12
}
```

Catatan: pada endpoint upload, field `fetchMs` merepresentasikan waktu parsing file HTML.

### Contoh penggunaan

```bash
curl -X POST http://localhost:8080/api/scrape-upload \
  -F "file=@sample.html" \
  -F "selector=div.content a" \
  -F "algorithm=BFS" \
  -F "limit=10" \
  -F "includeTraversalLog=true" \
  -F "includePathToMatch=true"
```

## Error Handling

Contoh error response:

```json
{
  "ok": false,
  "error": "selector is required"
}
```

Status code yang umum dipakai:

- `400 Bad Request`: input tidak valid.
- `405 Method Not Allowed`: method tidak sesuai.
- `502 Bad Gateway`: gagal fetch atau parse HTML dari URL.

## Rekomendasi Integrasi Frontend

- Gunakan `/api/scrape` untuk input berbasis URL.
- Gunakan `/api/scrape-upload` untuk input file HTML dari user.
- Gunakan `/api/tree-upload` jika frontend hanya perlu menampilkan tree hasil parsing file.
- Gunakan `/api/health` untuk pengecekan server sebelum request utama.
