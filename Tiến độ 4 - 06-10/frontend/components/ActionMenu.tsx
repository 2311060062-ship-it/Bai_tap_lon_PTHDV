"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ActionMenuProps = {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  widthClass?: string;
};

export function ActionMenu({ open, onToggle, onClose, children, widthClass = "w-44" }: ActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const place = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight || 180;
    const menuWidth = menuRef.current?.offsetWidth || 176;
    const gap = 6;
    const openUp = rect.bottom + gap + menuHeight > window.innerHeight - 12;
    const top = openUp ? rect.top - menuHeight - gap : rect.bottom + gap;
    const left = Math.min(Math.max(8, rect.right - menuWidth), window.innerWidth - menuWidth - 8);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const id = requestAnimationFrame(place);
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      onClose();
    };
    const onScroll = () => place();
    window.addEventListener("mousedown", onClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className="rounded-lg border px-2 py-1 text-slate-500 hover:bg-slate-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          className={`fixed z-[80] overflow-hidden rounded-xl border bg-white py-1 shadow-lg ${widthClass}`}
          style={{ top: pos.top, left: pos.left }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
