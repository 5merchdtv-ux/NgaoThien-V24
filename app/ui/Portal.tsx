"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Đưa nội dung ra thẳng document.body.
 *
 * BẮT BUỘC dùng cho mọi lớp phủ toàn màn hình trong Dashboard. Nếu để lớp phủ
 * nằm trong cây DOM của Dashboard thì hỏng theo hai cách:
 *
 *  1. `.content-shell` có `position: relative; z-index: 2` nên tạo stacking
 *     context. Mọi thứ bên trong bị nhốt ở tầng 2, dù đặt z-index bao nhiêu
 *     cũng không vượt được sidebar (z-index 20) hay các thẻ vẽ sau nó.
 *  2. `.glass-panel` và `.tool-card` có `backdrop-filter` nên trở thành khối
 *     chứa cho `position: fixed`, làm lớp phủ bám vào panel thay vì bám màn hình.
 */
export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
