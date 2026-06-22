const TABLE_WRAPPER_CLASS = "note-table-scroll";

export function ensureTableScrollWrappers(root: HTMLElement) {
  root.querySelectorAll("table").forEach((table) => {
    const parent = table.parentElement;
    if (parent?.classList.contains(TABLE_WRAPPER_CLASS)) return;
    const wrapper = document.createElement("div");
    wrapper.className = TABLE_WRAPPER_CLASS;
    parent?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

export function hasWideTable(root: HTMLElement) {
  return Array.from(root.querySelectorAll("table")).some(
    (table) => table.scrollWidth > root.clientWidth * 0.92,
  );
}
