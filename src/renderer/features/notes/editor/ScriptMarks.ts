import { Mark } from "@tiptap/react";

export const SuperscriptMark = Mark.create({
  name: "superscript",
  excludes: "subscript",
  parseHTML: () => [{ tag: "sup" }],
  renderHTML: () => ["sup", 0],
});

export const SubscriptMark = Mark.create({
  name: "subscript",
  excludes: "superscript",
  parseHTML: () => [{ tag: "sub" }],
  renderHTML: () => ["sub", 0],
});
