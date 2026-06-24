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
  Plus,
  Redo2,
  Save,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MultiSelect } from "../../../shared/components/MultiSelect";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { cn } from "../../../shared/lib/utils";
import { useUiStore } from "../../../shared/store/ui.store";
import { CategoryFormDialog } from "../../categories/components/CategoryFormDialog";
import { useGetCategories } from "../../categories/hooks/useCategories";
import { useCreateNote, useGetNote, useGetNotes, useUpdateNote } from "../hooks/useNotes";

type Tool = {
  icon: typeof Bold;
  label: string;
  active?: () => boolean;
  run: () => void;
};
export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const { data: categoryItems = [] } = useGetCategories();
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [fullContent, setFullContent] = useState(false);
  const activityOpen = useUiStore((state) => state.activityOpen);
  const setActivityOpen = useUiStore((state) => state.setActivityOpen);
  const existing = useGetNote(id);
  // ponytail: local selector covers first 100 notes; switch to async search when needed.
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const create = useCreateNote();
  const update = useUpdateNote();
  const initialized = useRef(false);
  const activityBeforeFullContent = useRef(activityOpen);
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
  useEffect(() => {
    if (!editor || !existing.data || initialized.current) return;
    initialized.current = true;
    setTitle(existing.data.title);
    setCategoryIds(existing.data.categoryIds);
    setRelatedIds(existing.data.relatedIds);
    editor.commands.setContent(existing.data.contentJson);
  }, [editor, existing.data]);
  const mutation = id ? update : create;
  const toggleFullContent = () => {
    if (fullContent) {
      setFullContent(false);
      setActivityOpen(activityBeforeFullContent.current);
      return;
    }
    activityBeforeFullContent.current = activityOpen;
    setActivityOpen(false);
    setFullContent(true);
  };
  const save = () => {
    if (!editor || !title.trim()) return;
    const input = { title: title.trim(), contentJson: editor.getJSON(), categoryIds, relatedIds };
    const onSuccess = (note: { id: string }) => navigate(`/notes/${note.id}`);
    if (id) update.mutate({ id, input }, { onSuccess });
    else create.mutate(input, { onSuccess });
  };
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
    <div className={fullContent ? "flex h-full min-h-0 flex-col p-8" : "mx-auto flex h-full min-h-0 max-w-7xl flex-col p-8"}>
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="mb-1 text-2xl">{id ? "Edit memory" : "Create a new memory"}</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Keep it useful, not perfect.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={toggleFullContent}>
            {fullContent ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {fullContent ? "Normal view" : "Full content"}
          </Button>
          <Button onClick={save} disabled={mutation.isPending || !title.trim()}>
            <Save size={16} /> {mutation.isPending ? "Saving…" : "Save memory"}
          </Button>
        </div>
      </div>
      {mutation.isError ? (
        <ErrorMessage message={getApiErrorMessage(mutation.error)} className="mb-4 shrink-0" />
      ) : null}
      {existing.isError ? (
        <ErrorMessage message={getApiErrorMessage(existing.error)} className="mb-4 shrink-0" />
      ) : null}
      {id && existing.isPending ? <div className="shrink-0 p-8 text-sm text-muted-foreground">Loading memory…</div> : null}
      <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="shrink-0 bg-white">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
        </div>
        <EditorContent editor={editor} className="note-editor min-h-0 flex-1 overflow-hidden px-7 py-4" />
      </Card>
      {!fullContent && <div className="mt-4 shrink-0 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex h-8 items-center justify-between">
              <Label className="block text-xs">Categories</Label>
              <CategoryFormDialog
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                    <Plus size={13} /> New category
                  </Button>
                }
                onSaved={(category) => {
                  setCategoryIds((ids) => [...ids, category.id]);
                }}
              />
            </div>
            <MultiSelect
              options={categoryItems.map((item) => ({
                value: item.id,
                label: item.name,
                color: item.color,
                description: item.description,
              }))}
              value={categoryIds}
              onChange={setCategoryIds}
              placeholder="Choose one or more categories"
              searchKey="categories"
            />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex h-8 items-center">
              <Label className="block text-xs">Related memories</Label>
            </div>
            <MultiSelect
              options={(noteList.data?.items ?? []).filter((item) => item.id !== id).map((item) => ({
                value: item.id,
                label: item.title,
                description: item.category,
              }))}
              value={relatedIds}
              onChange={setRelatedIds}
              placeholder="Link existing memories"
              maxVisible={3}
              searchKey="related-memories"
            />
          </div>
        </Card>
      </div>}
    </div>
  );
}
