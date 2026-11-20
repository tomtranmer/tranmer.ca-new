"use client";

import { useState } from "react";
import { MAX_REVIEW_NOTES, REVIEW_TOPICS, type ReviewTopicId } from "@/lib/reviewTopics";

type Status = "idle" | "submitting" | "sent" | "error";

const inputClass =
  "w-full rounded-lg border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/40 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export function ReviewRequestForm({ initialEmail, source }: { initialEmail: string; source: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [topics, setTopics] = useState<ReviewTopicId[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleTopic(id: ReviewTopicId) {
    setTopics((current) => (current.includes(id) ? current.filter((t) => t !== id) : [...current, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/review-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, website, topics, notes, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-green-600/30 bg-green-600/10 p-6">
        <h2 className="text-xl font-semibold">Thank you, your request is in.</h2>
        <p className="mt-2 text-foreground/70">
          We&rsquo;ll review your services and be in touch with our recommendations for 2027.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-foreground/15 p-6">
      <div>
        <label htmlFor="review-email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="review-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${inputClass} mt-1`}
        />
        {initialEmail && (
          <p className="mt-1 text-xs text-foreground/60">Filled in from your link. Change it if needed.</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="review-name" className="block text-sm font-medium">
            Name <span className="font-normal text-foreground/50">(optional)</span>
          </label>
          <input
            id="review-name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
        <div>
          <label htmlFor="review-website" className="block text-sm font-medium">
            Website <span className="font-normal text-foreground/50">(optional)</span>
          </label>
          <input
            id="review-website"
            type="text"
            autoComplete="url"
            maxLength={200}
            placeholder="example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">
          Anything in particular? <span className="font-normal text-foreground/50">(optional)</span>
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {REVIEW_TOPICS.map((topic) => (
            <label key={topic.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={topics.includes(topic.id)}
                onChange={() => toggleTopic(topic.id)}
                className="h-4 w-4 rounded border-foreground/30"
              />
              {topic.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-notes" className="block text-sm font-medium">
          Notes <span className="font-normal text-foreground/50">(optional)</span>
        </label>
        <textarea
          id="review-notes"
          rows={4}
          maxLength={MAX_REVIEW_NOTES}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Request my 2027 review"}
      </button>
    </form>
  );
}
