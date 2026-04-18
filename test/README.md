# Test Cases for CLI Pipeline

Folder ini berisi test case HTML manual dan expected output untuk pipeline:

HTML input -> Parse DOM -> BFS/DFS traversal + selector matching

## Struktur Folder

- `test/cases/`: input HTML
- `test/expected/`: expected output per skenario

## Daftar Skenario

1. `case01_basic_article`
- Tujuan: uji tag selector `article`
- Algoritma: BFS
- Limit: semua hasil

2. `case02_adjacent_sibling`
- Tujuan: uji combinator `img + p`
- Algoritma: BFS
- Limit: semua hasil

3. `case03_limit_topn`
- Tujuan: uji class selector `.entry` + Top-N
- Algoritma: DFS
- Limit: 2

4. `case04_empty_input`
- Tujuan: uji parser saat HTML kosong
- Ekspektasi: error `empty document`

5. `case05_class_whitespace_text`
- Tujuan: uji parsing class dengan banyak spasi + normalisasi text snippet
- Algoritma: BFS

6. `case06_adjacent_no_match`
- Tujuan: uji negative case untuk adjacent sibling `img + p`
- Algoritma: BFS

7. `case07_selector_list_unsupported`
- Tujuan: uji selector list (`div, p`) yang saat ini belum didukung
- Ekspektasi: 0 match

8. `case08_malformed_unclosed`
- Tujuan: uji HTML malformed (tag tidak ditutup)
- Ekspektasi: parser tetap menghasilkan tree dan traversal jalan

9. `case09_limit_gt_matches`
- Tujuan: uji limit lebih besar dari jumlah match aktual
- Ekspektasi: `stoppedByLimit=false`

10. `case10_invalid_algorithm`
- Tujuan: uji handling algoritma invalid
- Ekspektasi: error `unsupported algorithm`

## Cara Menjalankan

Jalankan CLI dari folder `backend`:

```bash
go run ./cmd/cli
```

Pilih mode `HTML manual`, lalu tempel isi file HTML dari `test/cases/...`.
Akhiri input HTML dengan `END` pada baris baru.

Masukkan selector, algoritma, dan limit sesuai field `input` pada file expected JSON.

## Catatan Validasi

Bandingkan minimal field berikut dengan expected:

- jumlah match (`matchCount`)
- jumlah node dikunjungi (`visitedCount`)
- depth maksimum (`maxDepthVisited`)
- status limit (`stoppedByLimit`)
- daftar node hasil (`matches`): `nodePath`, `tag`, `depth`, `visitStep`, `attributes`, `textSnippet`

`durationMs` tidak dimasukkan ke expected karena bergantung performa runtime mesin.

Untuk case error (`shouldError=true`), validasi cukup pada potongan pesan error (`errorContains`).
