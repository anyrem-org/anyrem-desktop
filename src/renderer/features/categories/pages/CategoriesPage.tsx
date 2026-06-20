import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/components/ui/dialog";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { cn } from "../../../shared/lib/utils";
import { notes } from "../../notes/api/notes.api";
import { categories as initialCategories } from "../api/categories.api";
import { CategoryIcon, categoryIconNames } from "../components/CategoryIcon";
import type { CategoryIcon as IconName } from "../types/category.types";

const colors = [
  "#6366f1",
  "#0ea5e9",
  "#a855f7",
  "#f59e0b",
  "#10b981",
  "#ef4444",
];

export function CategoriesPage() {
  const [items, setItems] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState<IconName>();
  // ponytail: mutate mock module only; backend API replaces this in next phase.
  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const category = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name: name.trim(),
      description,
      color,
      icon,
    };
    initialCategories.push(category);
    setItems([...initialCategories]);
    setName("");
    setDescription("");
    setOpen(false);
  };
  return (
    <div className="p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl">Categories</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Browse memories by context.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} /> New category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create category</DialogTitle>
              <DialogDescription>
                Group related memories under one context.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={create} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Architecture"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Input
                  id="category-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What belongs here?"
                />
              </div>
              <div className="space-y-2">
                <Label>Optional icon</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!icon ? "default" : "outline"}
                    onClick={() => setIcon(undefined)}
                  >
                    None
                  </Button>
                  {categoryIconNames.map((item) => (
                    <Button
                      type="button"
                      key={item}
                      variant={icon === item ? "default" : "outline"}
                      size="icon"
                      onClick={() => setIcon(item)}
                    >
                      <CategoryIcon name={item} size={17} />
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colors.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setColor(item)}
                      className={cn(
                        "size-8 rounded-full border-4 border-white shadow-sm ring-offset-2",
                        color === item && "ring-2 ring-primary",
                      )}
                      style={{ background: item }}
                      aria-label={item}
                    />
                  ))}
                </div>
              </div>
              <Button className="w-full">Create category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-7 grid grid-cols-3 gap-4">
        {items.map((item) => {
          const count = notes.filter((note) =>
            note.categoryIds.includes(item.id),
          ).length;
          return (
            <Link
              key={item.id}
              to={`/categories/${item.id}`}
              className="no-underline"
            >
              <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <span
                      className="grid size-11 place-items-center rounded-xl"
                      style={{
                        background: `${item.color}14`,
                        color: item.color,
                      }}
                    >
                      <CategoryIcon name={item.icon} />
                    </span>
                    <Badge>{count} notes</Badge>
                  </div>
                  <h3 className="mb-1 mt-5 text-foreground">{item.name}</h3>
                  <p className="m-0 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
