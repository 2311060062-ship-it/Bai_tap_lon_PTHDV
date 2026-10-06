"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
  className?: string;
  cursorClassName?: string;
}

/**
 * Typewriter – Hiệu ứng đánh máy động với nhiều câu chữ xoay vòng
 */
export function Typewriter({
  texts,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseMs = 1800,
  className = "",
  cursorClassName = "",
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [textIdx, setTextIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const currentText = texts[textIdx % texts.length];

    const tick = () => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (!isDeleting) {
        if (displayed.length < currentText.length) {
          setDisplayed(currentText.slice(0, displayed.length + 1));
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          setIsPaused(true);
          timeoutRef.current = setTimeout(tick, pauseMs);
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1));
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        } else {
          setIsDeleting(false);
          setTextIdx((i) => (i + 1) % texts.length);
          timeoutRef.current = setTimeout(tick, typingSpeed);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, isPaused, textIdx, texts, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={className}>
      {displayed}
      <span
        className={`animate-typewriter-cursor ml-0.5 inline-block h-[1em] w-[2px] align-middle bg-current ${cursorClassName}`}
      />
    </span>
  );
}
