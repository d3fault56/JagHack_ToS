To# CHRONOS-LEX: The ToS Shredder

> *"In a world where every click is a contract, only the sharpest eyes survive."*

A cyberpunk-themed Terms of Service analyzer powered by Google Gemini. Paste any ToS or Privacy Policy and get a Street-Samurai threat analysis identifying **Identity Harvesting**, **Financial Traps**, and **Neural Privacy** violations — with a 0-100 Danger Score.

---

## ⚡ Quick Start (Hackathon Mode)

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier works)

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Open
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

---

## 🏗️ Project Structure

```
chronos-lex/
├── backend/
│   ├── server.js          # Express + Gemini integration
│   ├── package.json
│   └── .env               # GEMINI_API_KEY goes here
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main UI — dual-panel terminal
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js # Cyberpunk palette
│   ├── vite.config.js     # Proxy to backend
│   └── package.json
└── README.md
```

---

## 🔑 Environment Variables

Create `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
PORT=3001
```

---

## 🧠 Gemini System Prompt: Street-Samurai Persona

The AI analyzes text for three threat categories:

| Category | Cyberpunk Name | What It Finds |
|---|---|---|
| Identity Harvesting | `IDENTITY_HARVEST.sys` | Biometric collection, behavioral tracking, third-party data sales |
| Financial Traps | `FINANCIAL_EXTRACT.dll` | Auto-renewals, arbitration clauses, hidden fees |
| Neural Privacy | `NEURAL_PRIVACY.exe` | Content ownership, message scanning, AI training on your data |

### Danger Score Triggers
| Clause | Score Impact |
|---|---|
| Selling data to third parties | +15 |
| Biometric data collection | +15 |
| Perpetual/irrevocable content license | +12 |
| Binding arbitration | +12 |
| Monitoring private communications | +12 |
| Auto-renewal without notice | +10 |
| No right to delete / indefinite retention | +10 |

---

## 🎨 Design System

**Colors:**
- `#00ff41` — Matrix Green (safe / primary UI)
- `#ff003c` — Cyber Red (critical threats)
- `#050505` — Deep Black (background)
- `#cc00ff` — Neon Purple (neural privacy)
- `#ff8800` — Neon Orange (financial warnings)

**Effects:** Glitch headers, CRT scanlines, typewriter output, neon glow meters

---

## 🚀 Future: Chrome Extension

1. Add a `manifest.json` (Manifest V3) with `activeTab` permission
2. Use `chrome.scripting.executeScript` to extract `document.body.innerText`
3. Send to the same `/api/analyze` endpoint
4. Render a popup with the Danger Meter and collapsed threat summary
5. Add a badge icon that turns red when threats > 60 are detected on a page

---

## 📡 API Reference

### `POST /api/analyze`
```json
// Request
{ "text": "<raw ToS or Privacy Policy text>" }

// Response
{
  "danger_score": 78,
  "identity_harvesting": "Street-samurai analysis...",
  "financial_traps": "Street-samurai analysis...",
  "neural_privacy": "Street-samurai analysis...",
  "verdict": "Final verdict..."
}
```

---

*Built in a 10-hour hackathon sprint. Stay sharp, choomba.*
