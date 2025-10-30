"use client";
import { useEffect, useState } from "react";

const slides = [
  { text: "Hi I'm Tom..." },
  { text: "I build things, mostly digital." },
  { text: "How can we help?" },
];

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let duration = 1500;
    if (slide === 0) duration = 1000; // Slide 1 (index 0) is 50% longer
    if (slide < slides.length - 1) {
      const t = setTimeout(() => setSlide(slide + 1), duration);
      return () => clearTimeout(t);
    } else {
      // Fade out after last slide
      const t = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [slide, onFinish]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-500">
      {slides.map((s, i) => (
        <span
          key={i}
          className={`absolute text-2xl sm:text-4xl font-bold text-white transition-opacity duration-500 ${slide === i ? 'opacity-100' : 'opacity-0'}`}
        >
          {s.text}
        </span>
      ))}
    </div>
  );
}
