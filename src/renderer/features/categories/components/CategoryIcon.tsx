import {
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  Code2,
  Database,
  FileText,
  Folder,
  Heart,
  Home,
  Image,
  Lightbulb,
  MessageSquare,
  Music,
  Palette,
  Rocket,
  Search,
  Shield,
  Star,
  Tag,
  Target,
  Wrench,
  Zap,
} from "lucide-react";
import { categoryIconNames, type CategoryIcon as IconName } from "../types/category.types";

const icons = {
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  CalendarDays,
  Code2,
  Database,
  FileText,
  Folder,
  Heart,
  Home,
  Image,
  Lightbulb,
  MessageSquare,
  Music,
  Palette,
  Rocket,
  Search,
  Shield,
  Star,
  Tag,
  Target,
  Wrench,
  Zap,
};
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
