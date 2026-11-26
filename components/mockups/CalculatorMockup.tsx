"use client";

import { useState } from "react";

type Op = "+" | "−" | "×" | "÷";

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
  }
}

function format(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  // Trim float noise (0.1 + 0.2) and keep the display short.
  const s = String(parseFloat(n.toPrecision(12)));
  return s.length > 12 ? n.toExponential(6) : s;
}

export function CalculatorMockup() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true); // next digit starts a new number

  const digit = (d: string) => {
    if (display === "Error" || fresh) {
      setDisplay(d === "." ? "0." : d);
      setFresh(false);
      return;
    }
    if (d === "." && display.includes(".")) return;
    if (display.replace(/[-.]/g, "").length >= 9) return;
    setDisplay(display === "0" && d !== "." ? d : display + d);
  };

  const operator = (next: Op) => {
    const current = parseFloat(display);
    if (stored !== null && op && !fresh) {
      const result = apply(stored, current, op);
      setDisplay(format(result));
      setStored(result);
    } else {
      setStored(current);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (stored === null || !op) return;
    setDisplay(format(apply(stored, parseFloat(display), op)));
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  const negate = () => display !== "Error" && setDisplay(format(-parseFloat(display)));
  const percent = () => display !== "Error" && setDisplay(format(parseFloat(display) / 100));

  const grey = "bg-zinc-400 text-black active:bg-zinc-300";
  const dark = "bg-zinc-800 text-white active:bg-zinc-600";
  const orange = "bg-orange-500 text-white active:bg-orange-300";

  const keys: { label: string; onClick: () => void; style: string; wide?: boolean; active?: boolean }[] = [
    { label: stored === null && display === "0" ? "AC" : "C", onClick: clear, style: grey },
    { label: "±", onClick: negate, style: grey },
    { label: "%", onClick: percent, style: grey },
    { label: "÷", onClick: () => operator("÷"), style: orange, active: op === "÷" && fresh },
    ...["7", "8", "9"].map((d) => ({ label: d, onClick: () => digit(d), style: dark })),
    { label: "×", onClick: () => operator("×"), style: orange, active: op === "×" && fresh },
    ...["4", "5", "6"].map((d) => ({ label: d, onClick: () => digit(d), style: dark })),
    { label: "−", onClick: () => operator("−"), style: orange, active: op === "−" && fresh },
    ...["1", "2", "3"].map((d) => ({ label: d, onClick: () => digit(d), style: dark })),
    { label: "+", onClick: () => operator("+"), style: orange, active: op === "+" && fresh },
    { label: "0", onClick: () => digit("0"), style: dark, wide: true },
    { label: ".", onClick: () => digit("."), style: dark },
    { label: "=", onClick: equals, style: orange },
  ];

  return (
    <div className="flex flex-col gap-4">
      <output
        aria-live="polite"
        className="block h-24 px-2 text-right text-6xl font-light text-white tabular-nums overflow-hidden"
      >
        {display}
      </output>
      <div className="grid grid-cols-4 gap-3">
        {keys.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={k.onClick}
            className={`h-16 rounded-full text-2xl font-medium transition-colors ${k.style} ${
              k.wide ? "col-span-2 text-left pl-7" : ""
            } ${k.active ? "bg-white! text-orange-500!" : ""}`}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
