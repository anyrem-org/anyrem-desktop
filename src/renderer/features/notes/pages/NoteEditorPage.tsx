import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
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
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Plus,
  Redo2,
  Save,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  TableCellsMerge,
  TableCellsSplit,
  TableColumnsSplit,
  TableProperties,
  TableRowsSplit,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MultiSelect } from "../../../shared/components/MultiSelect";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { Button } from "../../../shared/components/ui/button";
import { Card } from "../../../shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import { cn } from "../../../shared/lib/utils";
import { useUiStore } from "../../../shared/store/ui.store";
import { CategoryFormDialog } from "../../categories/components/CategoryFormDialog";
import { useGetCategories } from "../../categories/hooks/useCategories";
import { ImageNode } from "../editor/ImageNode";
import { SubscriptMark, SuperscriptMark } from "../editor/ScriptMarks";
import { insertImages, pasteImages } from "../editor/image-upload";
import { codeLanguages, lowlight } from "../editor/lowlight";
import { useCreateNote, useGetNote, useGetNotes, useUpdateNote } from "../hooks/useNotes";

type Tool = {
  icon: typeof Bold;
  label: string;
  active?: () => boolean;
  run: () => void;
};

type ToolGroup = {
  icon: typeof Bold;
  label: string;
  tools: Tool[];
};

export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const { data: categoryItems = [] } = useGetCategories();
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const setActivityOpen = useUiStore((state) => state.setActivityOpen);
  const existing = useGetNote(id);
  // ponytail: local selector covers first 100 notes; switch to async search when needed.
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const create = useCreateNote();
  const update = useUpdateNote();
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate(id ? `/notes/${id}` : "/search");
  const initialized = useRef(false);
  const editorRef = useRef<Parameters<typeof pasteImages>[0] | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Highlight,
      SuperscriptMark,
      SubscriptMark,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      ImageNode,
      Placeholder.configure({
        placeholder:
          "Start writing. Capture the useful part before it disappears…",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
    onDestroy: () => {
      editorRef.current = null;
    },
    editorProps: {
      handlePaste: (_view, event) =>
        editorRef.current ? pasteImages(editorRef.current, event) : false,
    },
  });
  useEffect(() => {
    if (!editor || !existing.data || initialized.current) return;
    initialized.current = true;
    setTitle(existing.data.title);
    setCategoryIds(existing.data.categoryIds);
    setRelatedIds(existing.data.relatedIds);
    editor.commands.setContent(existing.data.contentJson);
  }, [editor, existing.data]);
  useEffect(() => setActivityOpen(false), [setActivityOpen]);
  const mutation = id ? update : create;
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
  const addImages = (files: FileList | null) => {
    if (!editor || !files?.length) return;
    void insertImages(
      editor,
      Array.from(files).filter((file) => file.type.startsWith("image/")),
    );
  };
  const toolbar: Array<Tool | ToolGroup | "divider"> = editor
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
          label: "Text style",
          tools: [
            {
              icon: Heading1,
              label: "Paragraph",
              active: () => editor.isActive("paragraph"),
              run: () => editor.chain().focus().setParagraph().run(),
            },
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
          ],
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
        {
          icon: Code,
          label: "Inline code",
          active: () => editor.isActive("code"),
          run: () => editor.chain().focus().toggleCode().run(),
        },
        {
          icon: Superscript,
          label: "Superscript",
          active: () => editor.isActive("superscript"),
          run: () => editor.chain().focus().toggleMark("superscript").run(),
        },
        {
          icon: Subscript,
          label: "Subscript",
          active: () => editor.isActive("subscript"),
          run: () => editor.chain().focus().toggleMark("subscript").run(),
        },
        "divider",
        {
          icon: List,
          label: "Blocks",
          tools: [
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
              label: "Code block (auto)",
              active: () => editor.isActive("codeBlock"),
              run: () => editor.chain().focus().toggleCodeBlock().run(),
            },
            ...codeLanguages
              .filter((language) => language.value)
              .map<Tool>((language) => ({
                icon: Code,
                label: language.label,
                active: () => editor.isActive("codeBlock", { language: language.value }),
                run: () =>
                  editor
                    .chain()
                    .focus()
                    .toggleCodeBlock({ language: language.value! })
                    .run(),
              })),
          ],
        },
        {
          icon: AlignLeft,
          label: "Text align",
          tools: [
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
              icon: AlignJustify,
              label: "Justify",
              active: () => editor.isActive({ textAlign: "justify" }),
              run: () => editor.chain().focus().setTextAlign("justify").run(),
            },
          ],
        },
        {
          icon: Table2,
          label: "Table",
          tools: [
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
            {
              icon: TableRowsSplit,
              label: "Add row",
              run: () => editor.chain().focus().addRowAfter().run(),
            },
            {
              icon: Trash2,
              label: "Delete row",
              run: () => editor.chain().focus().deleteRow().run(),
            },
            {
              icon: TableColumnsSplit,
              label: "Add column",
              run: () => editor.chain().focus().addColumnAfter().run(),
            },
            {
              icon: Trash2,
              label: "Delete column",
              run: () => editor.chain().focus().deleteColumn().run(),
            },
            {
              icon: TableProperties,
              label: "Toggle header row",
              run: () => editor.chain().focus().toggleHeaderRow().run(),
            },
            {
              icon: TableCellsMerge,
              label: "Merge cells",
              run: () => editor.chain().focus().mergeCells().run(),
            },
            {
              icon: TableCellsSplit,
              label: "Split cell",
              run: () => editor.chain().focus().splitCell().run(),
            },
            {
              icon: Trash2,
              label: "Delete table",
              run: () => editor.chain().focus().deleteTable().run(),
            },
          ],
        },
        "divider",
        {
          icon: ImagePlus,
          label: "Add image",
          run: () => imageInputRef.current?.click(),
        },
      ]
    : [];
  return (
    <div className="flex h-full min-h-0 flex-col p-8">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <Button type="button" variant="ghost" onClick={goBack} className="mb-5">
            <ArrowLeft size={16} /> Back
          </Button>
          <h2 className="mb-1 text-2xl">{id ? "Edit memory" : "Create a new memory"}</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Keep it useful, not perfect.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                addImages(event.target.files);
                event.target.value = "";
              }}
            />
            {toolbar.map((tool, index) =>
              tool === "divider" ? (
                <span key={index} className="mx-1 h-6 w-px bg-border" />
              ) : "tools" in tool ? (
                <ToolbarMenu key={tool.label} group={tool} />
              ) : (
                <ToolbarButton key={tool.label} tool={tool} />
              ),
            )}
          </div>
        </div>
        <EditorContent editor={editor} className="note-editor min-h-0 flex-1 overflow-hidden px-7 py-4" />
      </Card>
      <div className="mt-4 shrink-0 grid grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}

function ToolbarButton({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Button
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
      <Icon size={16} />
    </Button>
  );
}

function ToolbarMenu({ group }: { group: ToolGroup }) {
  const Icon = group.icon;
  const active = group.tools.some((tool) => tool.active?.());
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          title={group.label}
          variant="ghost"
          className={cn("h-8 gap-1 px-2", active && "bg-accent text-accent-foreground")}
        >
          <Icon size={16} />
          <ChevronDown size={13} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {group.tools.map((tool) => {
          const ToolIcon = tool.icon;
          return (
            <DropdownMenuItem
              key={tool.label}
              onSelect={tool.run}
              className={cn(tool.active?.() && "bg-accent text-accent-foreground")}
            >
              <ToolIcon size={15} />
              {tool.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
