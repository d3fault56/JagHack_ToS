# Chronos-Lex

A cyberpunk-themed Terms of Service analyzer. Paste any ToS or Privacy Policy and it'll break down the sketchy parts in plain English — data harvesting, hidden fees, arbitration traps — with a danger score from 0 to 100.

Built at a hackathon in about 10 hours using React, Python, and Google Gemini.

---

## Running it

The first time you use it, run the setup script. This builds the frontend and installs all the Python dependencies:

```bash
cd Desktop/chronos-lex
chmod +x setup.sh run.sh
./setup.sh
```

Once that's done, open `standalone/.env` and paste in your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

You can get a free key at https://aistudio.google.com/apikey — just sign in with a Google account and create one.

After that, every time you want to run the app:

```bash
cd standalone
source venv/bin/activate
python3 server.py
```

It'll open the browser automatically at http://localhost:8080.

---

## What's in the project

```
chronos-lex/
├── setup.sh              runs once to build everything
├── standalone/
│   ├── server.py         the main Python server — handles both the API and serving the frontend
│   ├── requirements.txt  Python packages
│   ├── .env              your API key goes here
│   └── dist/             the built React app (created by setup.sh)
└── frontend/             React source code, only needed if you want to make changes
```

---

## How it works

When you paste a ToS and hit the button, the text gets sent to Google Gemini with a detailed prompt that tells it to look for three things:

- **Identity Harvesting** — data collection, biometrics, location tracking, selling your info to third parties
- **Financial Traps** — auto-renewals, hidden fees, arbitration clauses, cancellation penalties
- **Neural Privacy** — who owns your content, whether they scan your messages, AI training on your data

Gemini responds with a structured breakdown and a danger score from 0 to 100. The frontend shows it all in a cyberpunk terminal UI with a color-coded threat meter.

The danger score is based on a rubric — things like binding arbitration (+12), biometric data collection (+15), or auto-renewals without notice (+10) all push the score up.

---

## Gemini model

Right now it uses `gemini-2.5-flash`. If you ever get a "model not found" error, the model name probably changed. You can check which ones are available with:

```bash
cd standalone
source venv/bin/activate
python3 -c "
import google.generativeai as genai
import os
from dotenv import load_dotenv
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
"
```

Then just update `model_name` in `standalone/server.py` to whatever shows up.

---

## Common issues

**`ModuleNotFoundError: No module named 'fastapi'`**
The virtual environment isn't active. Run `source venv/bin/activate` first.

**`source: no such file or directory: venv/bin/activate`**
The venv doesn't exist yet. Run:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**`NameError: name 'Path' is not defined`** or **`NameError: name 'uvicorn' is not defined`**
Missing imports at the top of server.py. Make sure these lines are there:
```python
from pathlib import Path
import uvicorn
```

**"Neural Link Failure" in the browser**
Check what the terminal says — the actual error will be printed there. Usually it's one of:
- The `.env` file is missing or the API key isn't set
- The virtual environment isn't activated
- The Gemini model name is outdated

**429 rate limit error**
You've hit the free tier quota. Either wait a few hours for it to reset, generate a new API key, or enable billing on your Google account (each analysis costs less than a cent).

---

## Making changes to the frontend

If you edit anything in the `frontend/src` folder, you need to rebuild and copy the files over:

```bash
cd frontend
npm run build
cp -r dist ../standalone/dist
```

Then restart the server.

---

## Future ideas

A few things that would make this more useful:

- Chrome extension that scans ToS pages automatically as you browse
- PDF upload so you don't have to copy and paste
- Comparing two contracts side by side
- A public database of scores for popular apps
- Hosting it online so you can share a link

---

## API key security

Don't commit your `.env` file to GitHub or share it anywhere. If it gets exposed, go to https://aistudio.google.com/apikey and delete the old key and create a new one. The `.env` file is already in `.gitignore` by default but worth double checking.
