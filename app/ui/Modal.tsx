"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  /** Nội dung phụ bên phải tiêu đề, ví dụ hàng tab chuyển module. */
  actions?: ReactNode;
  /** "wide" cho bảng nhiều cột, "full" cho công cụ nặng như Vận hành nâng cao. */
  size?: "normal" | "wide" | "full";
  children: ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  kicker,
  actions,
  size = "wide",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  /**
   * BẮT BUỘC dùng portal ra thẳng document.body.
   * Nếu để modal nằm trong cây DOM của Dashboard thì hỏng theo hai cách:
   *  1. .content-shell có position:relative + z-index:2 tạo stacking context,
   *     khiến modal không bao giờ vượt được sidebar (z-index 20).
   *  2. .glass-panel có backdrop-filter nên trở thành khối chứa cho
   *     position:fixed, làm modal bám vào panel thay vì bám màn hình.
   */
  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-panel ${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
      >
        <header className="modal-head">
          <div className="modal-title">
            {kicker ? <span className="modal-kicker">{kicker}</span> : null}
            <h2>{title}</h2>
          </div>
          {actions ? <div className="modal-head-actions">{actions}</div> : null}
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
