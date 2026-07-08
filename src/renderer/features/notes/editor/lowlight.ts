import { common, createLowlight } from "lowlight";

export const lowlight = createLowlight(common);

export const codeLanguages = [
  { label: "Auto", value: null },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "JSON", value: "json" },
  { label: "Bash", value: "bash" },
  { label: "Python", value: "python" },
] as const;
