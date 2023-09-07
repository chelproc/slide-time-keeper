import { useEffect, useRef, useState } from "react";

export function AutoSize(props: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.text.trim()) return;
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const containerRect = container.getBoundingClientRect();

    let min = 1;
    let max = 1;
    while (true) {
      content.style.fontSize = `${max}px`;
      const contentRect = content.getBoundingClientRect();
      if (contentRect.height > containerRect.height) break;
      min = max;
      max *= 2;
    }
    while (max - min > 1) {
      const mid = Math.floor((min + max) / 2);
      content.style.fontSize = `${mid}px`;
      const contentRect = content.getBoundingClientRect();
      if (contentRect.height > containerRect.height) {
        max = mid;
      } else {
        min = mid;
      }
    }
  }, [props.text]);

  return (
    <div
      ref={containerRef}
      style={{ overflow: "hidden", wordWrap: "break-word", padding: "10px" }}
    >
      <span ref={contentRef}>{props.text}</span>
    </div>
  );
}
