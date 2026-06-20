import { Bell, Code2, FileText, Folder, Lightbulb, Search } from "lucide-react";
import type { CategoryIcon as IconName } from "../types/category.types";

const icons = { Bell, Code2, FileText, Folder, Lightbulb, Search };
export const categoryIconNames = Object.keys(icons) as IconName[];
export function CategoryIcon({
  name = "Folder",
  size = 20,
}: {
  name?: IconName;
  size?: number;
}) {
  const Icon = icons[name];
  return <Icon size={size} />;
}
