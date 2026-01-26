"use client";

import { useEffect, ReactNode } from "react";

interface CopyProtectionProps {
  children: ReactNode;
}

export function CopyProtection({ children }: CopyProtectionProps) {
  useEffect(() => {
    // 右クリック無効化
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // テキスト選択無効化
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // コピー無効化
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // キーボードショートカット無効化 (Ctrl+C, Ctrl+U, Ctrl+S, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        return false;
      }
    };

    // ドラッグ無効化（画像のドラッグ防止）
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return (
    <div
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
}
