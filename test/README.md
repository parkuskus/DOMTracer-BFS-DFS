# Test Cases for CLI Pipeline

Folder ini berisi test case HTML manual dan expected output untuk pipeline:

HTML input -> Parse DOM -> BFS/DFS traversal + selector matching

## Struktur Folder

- `test/cases/case_<N>.html`: input HTML test case
- `test/expected/case_<N>_expected.json`: expected output untuk setiap test

## Daftar Skenario

### Unit Test Cases (Manual HTML)

**case_1**: Basic Tag Selector
- File: `case_1.html`
- Selector: `article`
- Algoritma: BFS
- Limit: semua hasil
- Tujuan: uji tag selector sederhana pada struktur HTML teratur

**case_2**: Adjacent Sibling Combinator
- File: `case_2.html`
- Selector: `img + p`
- Algoritma: BFS
- Limit: semua hasil
- Tujuan: uji combinator adjacent sibling (`+`) untuk elemen yang tepat setelah target

**case_3**: Top-N Limit dengan DFS
- File: `case_3.html`
- Selector: `.entry`
- Algoritma: DFS
- Limit: 2
- Tujuan: uji mekanisme Top-N limit dan verifikasi `stoppedByLimit=true`

**case_4**: Empty Input
- File: `case_4.html` (kosong)
- Selector: `*`
- Algoritma: BFS
- Ekspektasi: parser error `empty document`
- Tujuan: uji error handling pada HTML kosong

**case_5**: Class Selector dengan Whitespace Normalization
- File: `case_5.html`
- Selector: `.featured`
- Algoritma: BFS
- Tujuan: uji parsing class dengan multiple spaces dan normalisasi text snippet

**case_6**: Negative Case - Adjacent Sibling
- File: `case_6.html`
- Selector: `img + p`
- Algoritma: BFS
- Ekspektasi: 0 matches (order terbalik)
- Tujuan: verify combinator `+` tidak match ketika elemen dalam urutan salah

**case_7**: Selector List (Unsupported)
- File: `case_7.html`
- Selector: `div, p`
- Algoritma: BFS
- Ekspektasi: 0 matches (comma selector not yet supported)
- Tujuan: uji handling untuk fitur yang belum diimplementasi

**case_8**: Malformed HTML (Unclosed Tags)
- File: `case_8.html`
- Selector: `*`
- Algoritma: DFS
- Ekspektasi: parser tetap generate tree meski EOF
- Tujuan: uji robustness parser terhadap HTML yang tidak well-formed

**case_9**: Limit > Actual Matches
- File: `case_9.html`
- Selector: `.entry`
- Algoritma: DFS
- Limit: 10
- Ekspektasi: 2 matches, `stoppedByLimit=false` (tidak force stop)
- Tujuan: verify limit tidak memaksa berhenti jika matches < limit

**case_10**: Invalid Algorithm
- File: `case_10.html`
- Selector: `article`
- Algoritma: `RANDOM` (invalid)
- Ekspektasi: error `unsupported algorithm`
- Tujuan: uji validation untuk input algoritma yang tidak valid

### Integration Test Case (Live Website)

**case_11**: books.toscrape.com - Multiple Selector Tests
- File: `case_11.html` (51.3 KB)
- Source: https://books.toscrape.com/ (1 page dengan 20 produk)
- Test variants dengan berbagai selectors:

1. **case_11a**: Article Tag Selector (BFS)
   - Selector: `article.product_pod`
   - Expected: 20 matches, 541 nodes visited
   - Tujuan: Product cards pada halaman pertama

2. **case_11a2**: Descendant Combinator (BFS)
   - Selector: `h3 a`
   - Expected: 20 matches, 541 nodes visited
   - Tujuan: Book title links dengan descendant combinator

3. **case_11a3**: Class Selector dengan Top-5 Limit (DFS)
   - Selector: `.price_color`
   - Limit: 5
   - Expected: 5 matches, 239 nodes visited, `stoppedByLimit=true`
   - Tujuan: Harga buku dengan Top-N filtering

4. **case_11b**: Star Rating Selector (BFS)
   - Selector: `.star-rating`
   - Expected: 20 matches
   - Tujuan: Rating display untuk setiap produk

5. **case_11c**: Button Selector (DFS)
   - Selector: `.btn`
   - Expected: 20 matches
   - Tujuan: "Add to basket" buttons pada setiap produk

## Cara Menjalankan

Jalankan CLI dari folder `backend`:

```bash
go run ./cmd/cli
```

Pilih mode input (URL website / HTML manual / File HTML):
- Mode 1: Input URL website langsung
- Mode 2: Paste HTML manual, akhiri dengan `END` pada baris baru
- Mode 3: Baca dari file, contoh: `../test/cases/case_1.html`

Masukkan selector, algoritma (BFS/DFS), dan limit sesuai test description di README ini atau di file expected JSON.

## Validasi Expected Output

Bandingkan hasil traversal dengan field di expected JSON:

**Wajib divalidasi:**
- `matchCount`: jumlah elemen yang match selector
- `visitedCount`: total node yang dikunjungi traversal
- `maxDepthVisited`: depth maksimum dari root
- `stoppedByLimit`: apakah traversal stop karena Top-N limit
- `matches[]`: detail setiap match (nodePath, tag, depth, visitStep, attributes, textSnippet)

**Tidak perlu divalidasi:**
- `durationMs`: bergantung performa runtime mesin

**Error cases:**
- Field `shouldError=true` dengan `errorContains`: validasi pesan error mengandung substring yang diharapkan
