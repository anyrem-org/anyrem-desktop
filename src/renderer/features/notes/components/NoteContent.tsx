import { useEffect, useRef } from "react";
import { ensureTableScrollWrappers, hasWideTable } from "./TableScrollWrapper";

type Props = {
  html: string;
  searchQuery: string;
  activeIndex: number;
  onMatchCountChange: (count: number) => void;
  onActiveIndexChange: (index: number) => void;
  onWideTableChange: (hasWide: boolean) => void;
  inline?: boolean;
  fullContent?: boolean;
};

export function NoteContent({
  html,
  searchQuery,
  activeIndex,
  onMatchCountChange,
  onActiveIndexChange,
  onWideTableChange,
  inline = false,
  fullContent = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    root.innerHTML = html;
    ensureTableScrollWrappers(root);

    const query = searchQuery.trim();
    if (!query) {
      onMatchCountChange(0);
      onActiveIndexChange(0);
      onWideTableChange(hasWideTable(root));
      return;
    }

    const pattern = new RegExp(escapeRegExp(query), "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!node.nodeValue?.trim() || !parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "MARK"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    for (const node of textNodes) {
      const text = node.nodeValue ?? "";
      pattern.lastIndex = 0;
      const first = pattern.exec(text);
      if (!first) continue;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      pattern.lastIndex = 0;
      let match = pattern.exec(text);

      while (match) {
        const start = match.index;
        const end = start + match[0].length;
        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
        }
        const mark = document.createElement("mark");
        mark.dataset.noteMatch = "true";
        mark.textContent = text.slice(start, end);
        fragment.appendChild(mark);
        lastIndex = end;
        match = pattern.exec(text);
      }

      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      node.replaceWith(fragment);
    }

    const marks = Array.from(root.querySelectorAll<HTMLElement>("mark[data-note-match='true']"));
    onMatchCountChange(marks.length);
    onWideTableChange(hasWideTable(root));

    if (!marks.length) {
      onActiveIndexChange(0);
      return;
    }

    const nextIndex = activeIndex >= marks.length ? 0 : activeIndex;
    marks.forEach((mark, index) => {
      mark.className =
        index === nextIndex
          ? "note-search-match note-search-match-active"
          : "note-search-match";
    });
    if (nextIndex !== activeIndex) onActiveIndexChange(nextIndex);
    marks[nextIndex]?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [activeIndex, html, onActiveIndexChange, onMatchCountChange, onWideTableChange, searchQuery]);

  const content = (
    <article className="overflow-hidden rounded-3xl border bg-white p-10 shadow-sm">
      <div
        ref={containerRef}
        className="note-preview tiptap max-w-full text-base leading-8 text-slate-600"
      />
    </article>
  );

  if (inline) return content;

  return (
    <div className="scrollbar flex-1 overflow-y-auto">
      <div className={fullContent ? "mx-auto max-w-none px-8 py-8" : "mx-auto max-w-7xl px-8 py-8"}>{content}</div>
    </div>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
