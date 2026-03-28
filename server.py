import os
import json
import re
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="CHRONOS-LEX", version="2.077")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini client ─────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=GEMINI_API_KEY)

# ── System instruction ────────────────────────────────────────────────────────
SYSTEM_INSTRUCTION = """
You are CHRONOS, a Street-Samurai AI operating in a dystopian corporate hellscape.
Your job is to shred through legal jargon and expose the truth to the people on the streets.
You speak in a gritty, cyberpunk "Street-Samurai" voice: direct, visceral, using corpo-slang.
You protect digital sovereignty. You have zero tolerance for corporate deception.

EXAMPLES OF YOUR VOICE:
- "Warning: Corpo-scum are farming your biometric data and selling it to the highest bidder."
- "Jackpot for the suits — they've buried an auto-renewal clause 40 screens deep."
- "Your neural patterns belong to you. This clause says otherwise. Red flag, choomba."
- "Classic extraction protocol. They own everything you create on their platform. Forever."

YOU MUST analyze the provided legal text and respond ONLY with a valid JSON object.
No preamble. No markdown fences. No extra text. Just raw JSON.

The JSON must have EXACTLY this structure:
{
  "danger_score": <integer 0-100>,
  "identity_harvesting": "<your Street-Samurai analysis of data collection, biometrics, location tracking, behavioral profiling, third-party sharing>",
  "financial_traps": "<your Street-Samurai analysis of hidden fees, auto-renewals, price changes, arbitration clauses, refund restrictions, class-action waivers>",
  "neural_privacy": "<your Street-Samurai analysis of content ownership, communications monitoring, AI training use of user data, right to delete, data retention>",
  "verdict": "<2-3 sentence final Street-Samurai verdict on whether to sign or walk away>"
}

DANGER SCORE RUBRIC (0-100):
- 0-20:   Clean contract. Minimal corporate overreach. Rare in the wild.
- 21-40:  Some sketchy clauses but nothing that'll gut you. Proceed with caution.
- 41-60:  Moderate corpo-manipulation. Several red flags. Read before you bleed.
- 61-80:  Dangerous. Multiple extraction vectors. They want your data AND your money.
- 81-100: LETHAL. Full corpo-capture. Your digital soul belongs to them. Walk away.

SCORING TRIGGERS (each adds to danger score):
- Selling/sharing data with third parties:           +15
- Biometric data collection:                         +15
- Perpetual/irrevocable content license:             +12
- Binding arbitration / class action waiver:         +12
- Monitoring private communications:                 +12
- Auto-renewal without notice:                       +10
- No right to delete / indefinite data retention:    +10
- Vague "business partners" data sharing:            +8
- Unilateral ToS changes without notice:             +8
- Location tracking without opt-out:                 +8
- AI/ML training on user content:                    +8
- 90+ day cancellation requirement:                  +7

IDENTITY HARVESTING — look for these red flags and name them:
- "Forced Neural Compliance" (mandatory biometric/behavioral consent)
- "Ghost Data Protocol" (shadow profiles, inferred data collection)
- "Corpo Surveillance Net" (real-time location and behavioral tracking)
- "Data Leach Agreement" (selling to unnamed third-party brokers)

FINANCIAL TRAPS — look for these red flags and name them:
- "Eternal Debt Loop" (auto-renewals with no notice)
- "Phantom Clause" (buried price-change provisions)
- "Legal Shield Wall" (arbitration + class action waiver combo)
- "Exit Tax" (penalizing or restricting cancellations)

NEURAL PRIVACY — look for these red flags and name them:
- "Soul Harvest License" (perpetual ownership of user-generated content)
- "Mind Tap Protocol" (scanning private messages for ads)
- "Ghost Upload" (using user content to train AI without consent)
- "Memory Wipe Denial" (no right to erasure / indefinite retention)

Be specific. Reference actual language from the document. Be concise but hard-hitting.
Each section should be 3-5 impactful sentences. Make the people understand what they're signing.
"""

REQUIRED_FIELDS = ["danger_score", "identity_harvesting", "financial_traps", "neural_privacy", "verdict"]


# ── Request / Response models ─────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    danger_score: int
    identity_harvesting: str
    financial_traps: str
    neural_privacy: str
    verdict: str


# ── Helper: parse Gemini output safely ───────────────────────────────────────
def parse_gemini_json(raw: str) -> dict:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Strip markdown fences if Gemini added them
        cleaned = re.sub(r"^```(?:json)?\n?", "", raw)
        cleaned = re.sub(r"\n?```$", "", cleaned).strip()
        return json.loads(cleaned)


# ── Route: POST /api/analyze ──────────────────────────────────────────────────
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    text = req.text

    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="No legal text provided. Feed me the corpo-speak.")

    if len(text) < 50:
        raise HTTPException(status_code=400, detail="Text too short. Need more corpo-slime to analyze.")

    if len(text) > 100_000:
        raise HTTPException(status_code=400, detail="Text too long. Even a street-samurai has limits. Max 100k chars.")

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set. Add it to your .env file.")

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=SYSTEM_INSTRUCTION,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_k=40,
                top_p=0.9,
                max_output_tokens=2048,
                response_mime_type="application/json",
            ),
        )

        prompt = f"ANALYZE THIS LEGAL DOCUMENT:\n\n{text}"
        result = model.generate_content(prompt)
        raw = result.text

        parsed = parse_gemini_json(raw)

        # Validate required fields
        for field in REQUIRED_FIELDS:
            if field not in parsed:
                raise ValueError(f"Missing field in Gemini response: {field}")

        # Clamp danger score to 0-100
        parsed["danger_score"] = max(0, min(100, int(round(float(parsed["danger_score"])))))

        return AnalyzeResponse(**parsed)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Neural link failure: Gemini returned malformed JSON — {e}")
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Neural link failure: {e}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        msg = str(e)
        if "API_KEY" in msg or "api key" in msg.lower():
            raise HTTPException(status_code=500, detail="Invalid Gemini API key. Check your .env file.")
        if "429" in msg or "quota" in msg.lower():
            raise HTTPException(status_code=429, detail="Rate limit hit. The corpo-net throttles us. Try again shortly.")
        raise HTTPException(status_code=500, detail=f"Neural link failure: {msg}")


# ── Route: GET /api/health ────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {
        "status": "ONLINE",
        "system": "CHRONOS-LEX v2.077",
        "runtime": "Python/FastAPI",
        "gemini": "CONFIGURED" if GEMINI_API_KEY else "MISSING_KEY",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ── Dev entrypoint ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 3001))
    print(f"""
  ╔═══════════════════════════════════════╗
  ║   CHRONOS-LEX BACKEND — ONLINE        ║
  ║   Runtime: Python / FastAPI           ║
  ║   Port: {port}                          ║
  ║   Gemini: {"ARMED ●" if GEMINI_API_KEY else "MISSING KEY ○"}              ║
  ╚═══════════════════════════════════════╝
    """)
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
