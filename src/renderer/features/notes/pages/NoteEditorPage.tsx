import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import { MultiSelect } from "../../../shared/components/MultiSelect";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { cn } from "../../../shared/lib/utils";
import {
  categories,
  searchCategories,
} from "../../categories/api/categories.api";
import { notes, searchRelatedNotes } from "../api/notes.api";

type Tool = {
  icon: typeof Bold;
  label: string;
  active?: () => boolean;
  run: () => void;
};
const searchCategoryOptions = async (query: string) =>
  (await searchCategories(query)).map((item) => ({
    value: item.id,
    label: item.name,
    color: item.color,
    description: item.description,
  }));
const searchRelatedOptions = async (query: string) =>
  (await searchRelatedNotes(query)).map((item) => ({
    value: item.id,
    label: item.title,
    description: item.category,
  }));

export function NoteEditorPage() {
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder:
          "Start writing. Capture the useful part before it disappears…",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
  });
  const setLink = () => {
    const href = window.prompt("Link URL");
    if (href)
      editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };
  const tools: (Tool | "divider")[] = editor
    ? [
        {
          icon: Undo2,
          label: "Undo",
          run: () => editor.chain().focus().undo().run(),
        },
        {
          icon: Redo2,
          label: "Redo",
          run: () => editor.chain().focus().redo().run(),
        },
        "divider",
        {
          icon: Heading1,
          label: "Heading 1",
          active: () => editor.isActive("heading", { level: 1 }),
          run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          icon: Heading2,
          label: "Heading 2",
          active: () => editor.isActive("heading", { level: 2 }),
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          icon: Bold,
          label: "Bold",
          active: () => editor.isActive("bold"),
          run: () => editor.chain().focus().toggleBold().run(),
        },
        {
          icon: Italic,
          label: "Italic",
          active: () => editor.isActive("italic"),
          run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          icon: UnderlineIcon,
          label: "Underline",
          active: () => editor.isActive("underline"),
          run: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
          icon: Strikethrough,
          label: "Strike",
          active: () => editor.isActive("strike"),
          run: () => editor.chain().focus().toggleStrike().run(),
        },
        {
          icon: Highlighter,
          label: "Highlight",
          active: () => editor.isActive("highlight"),
          run: () => editor.chain().focus().toggleHighlight().run(),
        },
        {
          icon: Link2,
          label: "Link",
          active: () => editor.isActive("link"),
          run: setLink,
        },
        "divider",
        {
          icon: List,
          label: "Bullet list",
          active: () => editor.isActive("bulletList"),
          run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          icon: ListOrdered,
          label: "Numbered list",
          active: () => editor.isActive("orderedList"),
          run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          icon: Quote,
          label: "Quote",
          active: () => editor.isActive("blockquote"),
          run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          icon: Code,
          label: "Code block",
          active: () => editor.isActive("codeBlock"),
          run: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          icon: AlignLeft,
          label: "Align left",
          active: () => editor.isActive({ textAlign: "left" }),
          run: () => editor.chain().focus().setTextAlign("left").run(),
        },
        {
          icon: AlignCenter,
          label: "Align center",
          active: () => editor.isActive({ textAlign: "center" }),
          run: () => editor.chain().focus().setTextAlign("center").run(),
        },
        {
          icon: AlignRight,
          label: "Align right",
          active: () => editor.isActive({ textAlign: "right" }),
          run: () => editor.chain().focus().setTextAlign("right").run(),
        },
        {
          icon: Table2,
          label: "Insert table",
          run: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
        },
      ]
    : [];
  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl">Create a new memory</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Keep it useful, not perfect.
          </p>
        </div>
        <Button>
          <Save size={16} /> Save memory
        </Button>
      </div>
      <Card className="overflow-hidden">
        <Input
          className="h-auto rounded-none border-0 border-b px-7 py-6 text-2xl font-bold shadow-none focus-visible:ring-0"
          placeholder="Memory title"
        />
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 px-4 py-2">
          {tools.map((tool, index) =>
            tool === "divider" ? (
              <span key={index} className="mx-1 h-6 w-px bg-border" />
            ) : (
              <Button
                key={tool.label}
                type="button"
                title={tool.label}
                variant="ghost"
                size="icon"
                onClick={tool.run}
                className={cn(
                  "size-8",
                  tool.active?.() && "bg-accent text-accent-foreground",
                )}
              >
                <tool.icon size={16} />
              </Button>
            ),
          )}
        </div>
        <EditorContent editor={editor} className="px-7 py-4" />
      </Card>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <Label className="mb-2 block">Categories</Label>
          <MultiSelect
            options={categories.map((item) => ({
              value: item.id,
              label: item.name,
              color: item.color,
              description: item.description,
            }))}
            value={categoryIds}
            onChange={setCategoryIds}
            placeholder="Choose one or more categories"
            searchKey="categories"
            onSearch={searchCategoryOptions}
          />
        </Card>
        <Card className="p-4">
          <Label className="mb-2 block">Related memories</Label>
          <MultiSelect
            options={notes.map((item) => ({
              value: item.id,
              label: item.title,
              description: item.category,
            }))}
            value={relatedIds}
            onChange={setRelatedIds}
            placeholder="Link existing memories"
            maxVisible={3}
            searchKey="related-memories"
            onSearch={searchRelatedOptions}
          />
        </Card>
      </div>
    </div>
  );
}
