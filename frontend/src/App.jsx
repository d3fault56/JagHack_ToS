import { useState, useEffect, useRef } from "react";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________";

function useGlitchText(text, active) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(null);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    iterRef.current = 0;
    const totalFrames = text.length * 3;
    const step = () => {
      iterRef.current++;
      setDisplay(
        text.split("").map((char, i) => {
          if (i < iterRef.current / 3) return char;
          if (char === " ") return " ";
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join("")
      );
      if (iterRef.current < totalFrames) frameRef.current = requestAnimationFrame(step);
      else setDisplay(text);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, active]);

  return display;
}

function DangerMeter({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct < 30 ? "#00ff41" : pct < 60 ? "#ffff00" : pct < 80 ? "#ff8800" : "#ff003c";
  const label = pct < 30 ? "NOMINAL" : pct < 60 ? "ELEVATED" : pct < 80 ? "CRITICAL" : "LETHAL";

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono tracking-widest text-[#00ff41]">THREAT MATRIX</span>
        <span className="text-xs font-mono" style={{ color }}>{label} [{pct}/100]</span>
      </div>
      <div className="relative h-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #00ff41 0%, ${color} 100%)`,
            boxShadow: `0 0 12px ${color}88`,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "repeating-linear-gradient(90deg, transparent 0px, transparent 8px, #000 8px, #000 10px)",
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        {[0, 25, 50, 75, 100].map((v) => (
          <span key={v} className="text-[9px] font-mono text-[#333]">{v}</span>
        ))}
      </div>
    </div>
  );
}

function TypewriterText({ text, speed = 12 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-[#00ff41]">█</span>}
    </span>
  );
}

function ScanLine() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 scanlines" />
      <div className="absolute inset-0 vignette" />
    </div>
  );
}

function ResultBlock({ data }) {
  if (!data) return null;
  const sections = [
    { key: "identity_harvesting", label: "IDENTITY HARVESTING", color: "#ff003c", icon: "◈" },
    { key: "financial_traps", label: "FINANCIAL TRAPS", color: "#ff8800", icon: "◆" },
    { key: "neural_privacy", label: "NEURAL PRIVACY", color: "#cc00ff", icon: "◉" },
    { key: "verdict", label: "STREET VERDICT", color: "#00ff41", icon: "▶" },
  ];

  return (
    <div className="space-y-4 font-mono text-sm">
      {data.danger_score !== undefined && (
        <DangerMeter score={data.danger_score} />
      )}
      {sections.map(({ key, label, color, icon }) =>
        data[key] ? (
          <div key={key} className="border rounded p-4" style={{ borderColor: `${color}44`, background: `${color}08` }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color }}>{icon}</span>
              <span className="text-xs tracking-widest" style={{ color }}>{label}</span>
            </div>
            <div className="text-[#b0ffb0] leading-relaxed whitespace-pre-wrap text-xs">
              <TypewriterText text={data[key]} speed={8} />
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [glitchActive, setGlitchActive] = useState(true);
  const title = useGlitchText("CHRONOS-LEX", glitchActive);

  useEffect(() => {
    const t = setTimeout(() => setGlitchActive(false), 2400);
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 600);
    }, 8000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Neural link failure");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleToS = `TERMS OF SERVICE — NEXACORP DIGITAL PLATFORM

By using our services, you grant NexaCorp and its corporate affiliates an irrevocable, perpetual, royalty-free, worldwide license to use, reproduce, modify, adapt, publish, translate, sublicense, and distribute any content you submit, post, or display.

We reserve the right to share your personal data, including biometric identifiers, location history, and behavioral patterns, with third-party advertising partners and data brokers without additional consent.

All disputes must be resolved through binding arbitration. You waive your right to participate in any class action lawsuit. The arbitration will be conducted under rules we select, at a location we choose, with arbitrators we approve.

We may automatically charge your stored payment method for service upgrades, premium features, or subscription renewals without prior notice. Cancellation requires 90 days written notice.

We collect and analyze the content of your private communications to improve our services and to serve you targeted advertisements. This data may be retained indefinitely.`;

  return (
    <div className="min-h-screen bg-[#050505] text-[#c0ffc0] font-mono overflow-hidden relative">
      <ScanLine />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        * { font-family: 'Share Tech Mono', monospace; }
        .title-font { font-family: 'Orbitron', sans-serif; }
        .scanlines {
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px);
        }
        .vignette {
          background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%);
        }
        .glitch-text {
          position: relative;
          display: inline-block;
        }
        .glitch-text::before, .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          overflow: hidden;
        }
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff003c;
          animation: glitch1 0.2s infinite linear alternate-reverse;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00ff41;
          animation: glitch2 0.3s infinite linear alternate-reverse;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
        }
        @keyframes glitch1 {
          0% { clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%); transform: translate(-2px, 0); }
          20% { clip-path: polygon(0 15%, 100% 15%, 100% 18%, 0 18%); transform: translate(2px, 0); }
          40% { clip-path: polygon(0 40%, 100% 40%, 100% 44%, 0 44%); transform: translate(-1px, 0); }
          60% { clip-path: polygon(0 60%, 100% 60%, 100% 65%, 0 65%); transform: translate(1px, 0); }
          80% { clip-path: polygon(0 80%, 100% 80%, 100% 84%, 0 84%); transform: translate(-2px, 0); }
          100% { clip-path: polygon(0 90%, 100% 90%, 100% 95%, 0 95%); transform: translate(2px, 0); }
        }
        @keyframes glitch2 {
          0% { clip-path: polygon(0 62%, 100% 62%, 100% 66%, 0 66%); transform: translate(2px, 0); }
          30% { clip-path: polygon(0 70%, 100% 70%, 100% 75%, 0 75%); transform: translate(-2px, 0); }
          60% { clip-path: polygon(0 80%, 100% 80%, 100% 83%, 0 83%); transform: translate(1px, 0); }
          100% { clip-path: polygon(0 90%, 100% 90%, 100% 95%, 0 95%); transform: translate(-1px, 0); }
        }
        .border-neon-green { border-color: #00ff41; }
        .neon-glow { box-shadow: 0 0 20px #00ff4122, inset 0 0 20px #00ff4108; }
        .btn-primary {
          background: transparent;
          border: 1px solid #00ff41;
          color: #00ff41;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #00ff41;
          transform: translateX(-100%);
          transition: transform 0.2s;
          z-index: -1;
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary:hover { color: #050505; box-shadow: 0 0 20px #00ff4166; }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary:disabled::before { display: none; }
        textarea {
          background: transparent !important;
          resize: none;
          caret-color: #00ff41;
          scrollbar-width: thin;
          scrollbar-color: #00ff4144 transparent;
        }
        textarea:focus { outline: none; }
        .loading-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        @keyframes dots {
          0%   { content: ''; }
          25%  { content: '.'; }
          50%  { content: '..'; }
          75%  { content: '...'; }
          100% { content: ''; }
        }
        .stat-pill {
          border: 1px solid #00ff4133;
          background: #00ff4108;
          padding: 2px 8px;
          border-radius: 2px;
          font-size: 10px;
          color: #00ff4188;
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-[#00ff4122] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            {["#ff003c", "#ffff00", "#00ff41"].map((c) => (
              <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            ))}
          </div>
          <div>
            <h1
              className="title-font text-xl font-black tracking-widest glitch-text"
              data-text={title}
              style={{ color: "#00ff41", textShadow: "0 0 20px #00ff4166" }}
            >
              {title}
            </h1>
            <p className="text-[9px] tracking-[0.3em] text-[#00ff4166] uppercase">
              Legal Intelligence Terminal v2.077
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-3 items-center">
          <span className="stat-pill">GEMINI CORE: ONLINE</span>
          <span className="stat-pill">THREAT DB: SYNCED</span>
          <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
        </div>
      </header>

      {/* Subheader bar */}
      <div className="border-b border-[#0d0d0d] bg-[#050505] px-6 py-2 flex gap-6 text-[10px] text-[#00ff4155] tracking-widest">
        {["NEURAL_INPUT.exe", "CRYPTO_PARSER.dll", "THREAT_MATRIX.sys", "STREET_VERDICT.out"].map((f) => (
          <span key={f} className="hover:text-[#00ff41] cursor-default transition-colors">{f}</span>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-100px)]">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-[#00ff4118] flex flex-col">
          <div className="border-b border-[#00ff4118] px-4 py-2 flex items-center justify-between bg-[#00ff4106]">
            <div className="flex items-center gap-2">
              <span className="text-[#ff003c] text-xs">◈</span>
              <span className="text-xs tracking-widest text-[#00ff4188]">NEURAL INPUT — RAW LEGAL DATA</span>
            </div>
            <button
              onClick={() => setInput(sampleToS)}
              className="text-[10px] text-[#00ff4155] hover:text-[#00ff41] transition-colors tracking-widest border border-[#00ff4122] px-2 py-0.5 hover:border-[#00ff41]"
            >
              [INJECT SAMPLE]
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`// PASTE TERMS OF SERVICE OR PRIVACY POLICY\n// SYSTEM WILL IDENTIFY:\n//   → IDENTITY HARVESTING VECTORS\n//   → FINANCIAL EXTRACTION PROTOCOLS\n//   → NEURAL PRIVACY VIOLATIONS\n\n> AWAITING INPUT...`}
              className="w-full h-full p-4 text-xs text-[#80d080] leading-relaxed placeholder-[#1a3a1a] border-0"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            />
            {input && (
              <div className="absolute bottom-3 right-3 text-[9px] text-[#00ff4133]">
                {input.length.toLocaleString()} CHARS | {input.split(/\s+/).filter(Boolean).length} TOKENS
              </div>
            )}
          </div>

          <div className="border-t border-[#00ff4118] p-4">
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="btn-primary w-full py-3 text-sm tracking-widest uppercase"
            >
              {loading ? (
                <span className="loading-dots">SHREDDING LEGALESE</span>
              ) : (
                "▶ EXECUTE SHRED PROTOCOL"
              )}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="border-b border-[#00ff4118] px-4 py-2 flex items-center gap-2 bg-[#00ff4106]">
            <span className="text-[#00ff41] text-xs">◉</span>
            <span className="text-xs tracking-widest text-[#00ff4188]">DECRYPTED OUTPUT — THREAT ANALYSIS</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!loading && !result && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-[#00ff4122] text-6xl mb-6 title-font font-black">
                  {"{>"}
                </div>
                <p className="text-xs text-[#00ff4144] tracking-widest mb-2">SYSTEM STANDING BY</p>
                <p className="text-[10px] text-[#00ff4128] tracking-wider max-w-xs">
                  Paste a Terms of Service or Privacy Policy into the Neural Input panel, then execute the Shred Protocol.
                </p>
                <div className="mt-8 space-y-2 w-full max-w-xs">
                  {["IDENTITY HARVESTING", "FINANCIAL TRAPS", "NEURAL PRIVACY"].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className="h-px flex-1"
                        style={{ background: ["#ff003c22", "#ff880022", "#cc00ff22"][i] }}
                      />
                      <span className="text-[9px] tracking-widest" style={{ color: ["#ff003c44", "#ff880044", "#cc00ff44"][i] }}>
                        {label}
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: ["#ff003c22", "#ff880022", "#cc00ff22"][i] }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-3">
                <div className="text-xs text-[#00ff41] tracking-widest mb-4">
                  <TypewriterText text="// INITIALIZING THREAT SCAN..." speed={40} />
                </div>
                {[
                  "Parsing legalese syntax trees...",
                  "Cross-referencing corpo-manipulation vectors...",
                  "Scanning for financial extraction protocols...",
                  "Analyzing neural privacy violations...",
                  "Consulting street-samurai threat database...",
                ].map((msg, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-[#00ff4155] tracking-wider flex items-center gap-2"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <span className="text-[#00ff41] animate-spin inline-block">◌</span>
                    {msg}
                  </div>
                ))}
                <div className="mt-6 h-1 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00ff41] rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            )}

            {error && (
              <div className="border border-[#ff003c44] bg-[#ff003c08] rounded p-4">
                <div className="text-[#ff003c] text-xs tracking-widest mb-2">◈ NEURAL LINK FAILURE</div>
                <div className="text-xs text-[#ff8888]">{error}</div>
              </div>
            )}

            {result && !loading && <ResultBlock data={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
