import { useState, useEffect, useRef } from "react";
import { generateSecurePassword, type GeneratorOptions } from "./utils/cryptoGenerator";

const WEAK_WORDS = [
  "password", "pasword", "contraseña", "contrasenia", "pwd",
  "123456", "12345", "1234", "123", "12", "111111", "000000",
];

const ROAST_MSGS = [
  "en serio?? o.o",
  "...eso no es una contraseña nwn",
  "mi abuela lo adivinaría uwu",
  "hackeable en 0.001s o.o",
  "por favor... >;c",
  "eso ni cuenta como intento nwn",
];

const UNDERTALE_LINES = [
  "Ok.... tienes down...",
  "selecciona algo, tonto imbecil retardado",
];

function App() {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [roast, setRoast] = useState<string | null>(null);
  const [cardState, setCardState] = useState<"normal" | "flying" | "hidden" | "returning">("normal");
  const [undertaleMsg, setUndertaleMsg] = useState<string | null>(null);
  const [undertaleVisible, setUndertaleVisible] = useState(false);
  const [undertaleChar, setUndertaleChar] = useState("");
  const [options, setOptions] = useState<GeneratorOptions>({
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    mode: "random",
    baseText: "",
    extraChars: 16,
  });

  const disabledClicksRef = useRef(0);
  const disabledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undertaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasOptions =
    options.includeUppercase ||
    options.includeLowercase ||
    options.includeNumbers ||
    options.includeSymbols;

  const isDisabled = !hasOptions || (options.mode === "leet" && !options.baseText.trim());

  const handleGenerate = () => {
    if (isDisabled) {
      if (!hasOptions) {
        disabledClicksRef.current += 1;
        if (disabledTimerRef.current) clearTimeout(disabledTimerRef.current);
        disabledTimerRef.current = setTimeout(() => {
          disabledClicksRef.current = 0;
        }, 1500);

        if (disabledClicksRef.current >= 10 && cardState === "normal") {
          disabledClicksRef.current = 0;
          triggerAngryEscape();
        }
      }
      return;
    }
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
    setPassword(generateSecurePassword(options));
  };

  const triggerAngryEscape = () => {
    setCardState("flying");
    setTimeout(() => {
      setCardState("hidden");
      showUndertale(0);
    }, 600);
  };

  const showUndertale = (lineIndex: number) => {
    setUndertaleMsg(UNDERTALE_LINES[lineIndex]);
    setUndertaleVisible(true);
    setUndertaleChar("");

    let i = 0;
    const line = UNDERTALE_LINES[lineIndex];

    const typeInterval = setInterval(() => {
      i++;
      setUndertaleChar(line.slice(0, i));

      if (line[i - 1] !== " ") {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = "square";
          osc.frequency.setValueAtTime(90, audioCtx.currentTime);

          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.05);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          osc.stop(audioCtx.currentTime + 0.05);
        } catch (e) {
          console.error(e);
        }
      }

      if (i >= line.length) {
        clearInterval(typeInterval);
        if (lineIndex === 0) {
          undertaleTimerRef.current = setTimeout(() => {
            setUndertaleVisible(false);
            setTimeout(() => {
              setCardState("returning");
              setTimeout(() => {
                setCardState("normal");
                showUndertale(1);
              }, 500);
            }, 200);
          }, 1800);
        } else {
          undertaleTimerRef.current = setTimeout(() => {
            setUndertaleVisible(false);
            setUndertaleMsg(null);
          }, 2500);
        }
      }
    }, 60);
  };

  useEffect(() => {
    if (cardState !== "normal") return;

    if (options.mode === "leet" && !options.baseText.trim()) {
      setPassword("");
      return;
    }
    if (!hasOptions) {
      setPassword("");
      return;
    }
    setPassword(generateSecurePassword(options));
  }, [options, cardState]);

  useEffect(() => {
    if (cardState !== "normal" || options.mode !== "leet") {
      setRoast(null);
      return;
    }
    const val = options.baseText.trim().toLowerCase();
    if (WEAK_WORDS.some((w) => val === w || val.startsWith(w))) {
      const msg = ROAST_MSGS[Math.floor(Math.random() * ROAST_MSGS.length)];
      setRoast(msg);
      if (roastTimerRef.current) clearTimeout(roastTimerRef.current);
      roastTimerRef.current = setTimeout(() => setRoast(null), 3000);
    } else {
      setRoast(null);
    }
  }, [options.baseText, options.mode, cardState]);

  useEffect(() => {
    return () => {
      if (undertaleTimerRef.current) clearTimeout(undertaleTimerRef.current);
      if (disabledTimerRef.current) clearTimeout(disabledTimerRef.current);
      if (roastTimerRef.current) clearTimeout(roastTimerRef.current);
    };
  }, []);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleModeChange = (mode: "random" | "leet") => {
    setOptions({ ...options, mode, extraChars: mode === "leet" ? 4 : 16 });
  };

  const labels: Record<string, string> = {
    includeUppercase: "ABC",
    includeLowercase: "abc",
    includeNumbers: "123",
    includeSymbols: "!@#",
  };

  const emptyMsg =
    options.mode === "leet"
      ? "psst... escribe algo aca abajo o.o"
      : !hasOptions
        ? "elige algo, lo que sea... nwn"
        : "dale al botón uwu";

  const cardClass = {
    normal: "translate-x-0 translate-y-0 opacity-100",
    flying: "-translate-y-[120vh] rotate-12 opacity-0",
    hidden: "hidden",
    returning: "translate-y-[120vh] opacity-0",
  }[cardState];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111118] p-4 overflow-hidden">

      {undertaleVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[320px] bg-[#0a0a0f] border-2 border-[#e2e2e8] rounded-none px-5 py-4 font-mono text-[13px] text-[#e2e2e8] shadow-2xl">
          <div className="flex gap-3 items-start">
            <span className="text-violet-400 mt-0.5 text-lg leading-none">*</span>
            <span>{undertaleChar}<span className="animate-pulse">▌</span></span>
          </div>
        </div>
      )}

      <div
        className={`w-full max-w-[380px] rounded-[22px] bg-[#18181f] border border-[#2a2a35] p-5 flex flex-col gap-3.5 transition-all duration-500 ${cardClass}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#e2e2e8] tracking-tight">lockbox</span>
            <span className="text-[10px] font-mono text-[#444] border border-[#252530] rounded-md px-1.5 py-0.5">wip</span>
          </div>
          <span className="text-[10px] font-mono text-[#333]">v0.2</span>
        </div>

        <div className={`flex items-center gap-2.5 bg-[#0f0f14] border rounded-xl px-4 py-3 min-h-[54px] transition-colors ${password ? "border-[#2a2a35]" : "border-[#1e1e28]"}`}>
          <span className={`flex-1 font-mono text-[13px] break-all leading-relaxed select-all transition-all ${password ? "text-[#e2e2e8]" : "text-[#333] italic"} ${shaking ? "animate-[wiggle_0.4s_ease-in-out]" : ""}`}>
            {password || emptyMsg}
          </span>
          <button
            onClick={handleCopy}
            disabled={!password}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all disabled:opacity-20 ${copied ? "bg-[#1a2e28] border-[#1f3830] text-pink-300" : "bg-[#1e1e28] border-[#2e2e3e] text-[#a78bfa] hover:bg-[#252535]"}`}
          >
            {copied ? "owo" : "copiar"}
          </button>
        </div>

        <div className="flex bg-[#0f0f14] border border-[#1e1e28] p-1 rounded-xl font-mono text-[11px]">
          {(["random", "leet"] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 py-1.5 rounded-[8px] font-medium transition-all cursor-pointer ${options.mode === m ? "bg-[#1e1e28] text-violet-400 border border-[#2e2e3e]" : "text-[#444] hover:text-[#777]"}`}
            >
              {m === "random" ? "random" : "mnemotécnico"}
            </button>
          ))}
        </div>

        {options.mode === "leet" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#444]">tu palabra secreta nwn</span>
              {roast && (
                <span className="text-[11px] font-mono text-red-400 animate-[fadeIn_0.2s_ease-out]">
                  {roast}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="ej: pikachu"
              value={options.baseText}
              onChange={(e) => setOptions({ ...options, baseText: e.target.value })}
              className={`w-full bg-[#0f0f14] border rounded-xl px-3 py-2.5 text-[12px] font-mono text-[#e2e2e8] placeholder-[#2e2e3e] focus:outline-none transition-colors ${roast ? "border-red-900 focus:border-red-700" : "border-[#2a2a35] focus:border-[#3d2e6a]"}`}
            />
          </div>
        )}

        {options.mode === "random" && (
          <div className="animate-[fadeIn_0.15s_ease-out]">
            <div className="flex justify-between text-[11px] font-mono mb-2">
              <span className="text-[#444]">longitud</span>
              <span className="text-violet-400 font-medium tabular-nums">{options.extraChars} chars</span>
            </div>
            <input
              type="range" min="6" max="32" step="1"
              value={options.extraChars}
              onChange={(e) => setOptions({ ...options, extraChars: parseInt(e.target.value) })}
              className="w-full h-[2px] bg-[#1e1e28] rounded appearance-none cursor-pointer accent-violet-600 block"
            />
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(options) as Array<keyof GeneratorOptions>).map((key) => {
            if (key === "extraChars" || key === "mode" || key === "baseText") return null;
            const on = options[key] as boolean;
            return (
              <label
                key={key}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 bg-[#0f0f14] rounded-[10px] border cursor-pointer select-none transition-all ${on ? "border-[#3d2e6a] text-[#c4b5fd]" : "border-[#1e1e28] text-[#333] hover:border-[#2a2a35] hover:text-[#555]"}`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="sr-only"
                />
                <span className="text-[13px] font-mono font-semibold">{labels[key]}</span>
              </label>
            );
          })}
        </div>

        <button
          onClick={handleGenerate}
          disabled={options.mode === "leet" && !options.baseText.trim()}
          className="w-full py-2.5 bg-violet-700 hover:bg-violet-600 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed text-white font-medium rounded-[11px] text-[13px] font-mono transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
          otra vez
        </button>
      </div>
    </div>
  );
}

export default App;