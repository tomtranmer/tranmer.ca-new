"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Step = "email" | "code";
type Status = "idle" | "submitting" | "error";

// A 404 means the portal routes aren't deployed; point clients to email.
const REQUEST_CODE_URL = "/api/client/login/request";
const VERIFY_CODE_URL = "/api/client/login/verify";
const UNAVAILABLE_MSG =
  "Client login isn't available yet. Please email help@tranmer.ca to change your plan.";

export function ClientLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    firstInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  if (!open) return null;

  function handleClose() {
    setStep("email");
    setEmail("");
    setCode("");
    setStatus("idle");
    setErrorMsg("");
    onClose();
  }

  function fail(message: string) {
    setErrorMsg(message);
    setStatus("error");
  }

  async function post(url: string, body: object): Promise<Response | null> {
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 404) {
        fail(UNAVAILABLE_MSG);
        return null;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        fail((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        return null;
      }
      setStatus("idle");
      return res;
    } catch {
      fail("Network error. Please check your connection and try again.");
      return null;
    }
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      fail("Please enter a valid email address.");
      return;
    }
    if (await post(REQUEST_CODE_URL, { email: email.trim() })) setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      fail("Enter the 6-digit code from your email.");
      return;
    }
    if (await post(VERIFY_CODE_URL, { email: email.trim(), code: code.trim() })) {
      router.push("/web/account");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-foreground/20 bg-background px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  const submitting = status === "submitting";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-login-title"
        className="w-full max-w-sm rounded-2xl border border-foreground/15 bg-background p-6 text-foreground shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="client-login-title" className="text-xl font-bold">
          Client login
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          {step === "email"
            ? "We'll email you a one-time code."
            : `Enter the 6-digit code we sent to ${email.trim()}.`}
        </p>

        <form onSubmit={step === "email" ? requestCode : verifyCode} noValidate className="mt-5 space-y-3">
          {step === "email" ? (
            <input
              ref={firstInputRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className={inputClass}
              disabled={submitting}
            />
          ) : (
            <input
              ref={firstInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              aria-label="Login code"
              className={`${inputClass} text-center font-mono text-lg tracking-[0.5em]`}
              disabled={submitting}
            />
          )}

          {status === "error" && errorMsg && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Please wait…" : step === "email" ? "Email me a code" : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          {step === "code" ? (
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setStatus("idle");
                setErrorMsg("");
              }}
              className="text-foreground/60 hover:text-foreground"
            >
              Use a different email
            </button>
          ) : (
            <span />
          )}
          <button type="button" onClick={handleClose} className="text-foreground/60 hover:text-foreground">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
