# DOMTracer — IF2211 Tubes 2

**BFS / DFS CSS Selector Traversal Visualizer**

Frontend untuk Tugas Besar 2 IF2211 Strategi Algoritma: Pemanfaatan Algoritma BFS dan DFS dalam Mekanisme Penelusuran CSS pada pohon DOM.

---

## 🚀 Setup & Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Set URL backend di file .env (buat file baru)
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 3. Jalankan development server
npm run dev
```

Buka http://localhost:5173 di browser.

---

## 📁 Struktur File

```
src/
├── types.ts          # Semua interface TypeScript (TreeNodeData, ApiResponse, dll)
├── api.ts            # Fungsi fetch ke backend API
├── App.tsx           # Komponen induk, state management, layout utama
├── InputForm.tsx     # Form input: URL/HTML, algoritma, selector, limit
├── TreeNode.tsx      # Komponen rekursif visualisasi pohon DOM
├── MetricsPanel.tsx  # Panel metrik performa (waktu, node, match, depth)
├── TraversalLog.tsx  # Log step-by-step traversal dalam format terminal
├── index.css         # Global styles + Tailwind directives
└── main.tsx          # Entry point React
```

---

## 🔌 Kontrak API Backend

Frontend mengharapkan endpoint berikut dari backend:

### `POST /api/traverse`

**Request Body:**
```json
{
  "input": "https://example.com",
  "inputMode": "url",
  "algorithm": "BFS",
  "cssSelector": "div.container",
  "resultLimit": { "type": "all" }
}
```

atau untuk raw HTML:
```json
{
  "input": "<html>...</html>",
  "inputMode": "html",
  "algorithm": "DFS",
  "cssSelector": "p",
  "resultLimit": { "type": "top-n", "n": 5 }
}
```

**Response Body:**
```json
{
  "tree": {
    "tag": "html",
    "text": "",
    "attributes": {},
    "children": [...],
    "depth": 0,
    "isTraversed": true,
    "isMatched": false,
    "nodeId": "node-0"
  },
  "traversalLog": [
    {
      "step": 1,
      "nodeTag": "html",
      "nodeId": "node-0",
      "message": "Visiting root node <html>",
      "isMatch": false
    }
  ],
  "metrics": {
    "searchTimeMs": 12.345,
    "visitedNodeCount": 42,
    "matchedNodeCount": 3,
    "maxDepth": 7
  },
  "algorithm": "BFS",
  "selector": "div.container"
}
```

---

## 🎨 Fitur UI

- **Dark mode terminal aesthetic** dengan font JetBrains Mono
- **Form input** untuk URL/raw HTML, pilihan BFS/DFS, CSS selector, dan limit hasil
- **Pohon DOM rekursif** dengan collapse/expand per node
- **Color coding**: node matched (amber/gold), node traversed (cyan), node biasa (gray)
- **Depth-based border colors** untuk membedakan level kedalaman secara visual
- **Metrik performa**: waktu, node dikunjungi, match count, max depth + progress bar match ratio
- **Traversal log** dalam tampilan terminal dengan filter "only matches"
- **Loading spinner** dan **error state** yang informatif
