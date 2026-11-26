"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

function Row({ icon, label, children }: { icon: string; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-lg" aria-hidden>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {children}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">{title}</h2>
      <div className="divide-y divide-black/5 dark:divide-white/10 rounded-xl bg-white dark:bg-zinc-900">
        {children}
      </div>
    </section>
  );
}

export function SettingsMockup() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Demo-only switches: they change nothing outside this page.
  const [notifications, setNotifications] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div>
      <Group title="Appearance">
        <Row icon="🌙" label="Dark mode">
          {mounted && (
            <Toggle
              label="Dark mode"
              on={resolvedTheme === "dark"}
              onChange={(v) => setTheme(v ? "dark" : "light")}
            />
          )}
        </Row>
        <Row icon="🖼️" label="Wallpaper">
          <span className="text-foreground/50">Landscape</span>
        </Row>
      </Group>

      <Group title="General">
        <Row icon="🔔" label="Notifications">
          <Toggle label="Notifications" on={notifications} onChange={setNotifications} />
        </Row>
        <Row icon="✨" label="Reduce motion">
          <Toggle label="Reduce motion" on={reduceMotion} onChange={setReduceMotion} />
        </Row>
      </Group>

      <Group title="Tranmer Web Services">
        <Link href="/web" className="block hover:bg-black/5 dark:hover:bg-white/5">
          <Row icon="🖥️" label="Plans and pricing"><span className="text-foreground/40">›</span></Row>
        </Link>
        <Link href="/web/account" className="block hover:bg-black/5 dark:hover:bg-white/5">
          <Row icon="🔑" label="Client login"><span className="text-foreground/40">›</span></Row>
        </Link>
        <a href="mailto:help@tranmer.ca" className="block hover:bg-black/5 dark:hover:bg-white/5">
          <Row icon="✉️" label="help@tranmer.ca"><span className="text-foreground/40">›</span></Row>
        </a>
      </Group>

      <p className="mt-6 px-4 text-xs text-foreground/40">
        Demo screen. Only Dark mode is saved; the other switches reset when you leave.
      </p>
    </div>
  );
}
