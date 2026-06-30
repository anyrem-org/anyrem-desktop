import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, Code, Heading1, Heading2, Highlighter, Image as ImageIcon, Italic, Link2, List, ListOrdered, Plus, Quote, Redo2, Strikethrough, Table2, TableCellsMerge, TableCellsSplit, TableColumnsSplit, TableProperties, TableRowsSplit, Trash2, Underline as UnderlineIcon, Undo2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MultiSelect } from '../../../shared/components/MultiSelect';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { cn } from '../../../shared/lib/utils';
import { CategoryFormDialog } from '../../categories/components/CategoryFormDialog';
import { useGetCategories } from '../../categories/hooks/useCategories';
import { ImageNode } from '../../notes/editor/ImageNode';
import { pasteImages } from '../../notes/editor/image-upload';
import { useCreateNote, useGetNotes } from '../../notes/hooks/useNotes';

type Tool = {
  icon: typeof Bold;
  label: string;
  active?: () => boolean;
  run: () => void;
};

export function QuickCreatePage() {
  const categories = useGetCategories();
  const categoryOptions = (categories.data ?? []).map((item) => ({
    value: item.id,
    label: item.name,
    color: item.color,
    description: item.description,
  }));
  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  // ponytail: local selector covers first 100 notes; switch to async search when needed.
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const create = useCreateNote();
  const relatedOptions = (noteList.data?.items ?? []).map((item) => ({
    value: item.id,
    label: item.title,
    description: item.category,
  }));
  const editorRef = useRef<Parameters<typeof pasteImages>[0] | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      ImageNode,
      Placeholder.configure({
        placeholder:
          'Start writing. Capture the useful part before it disappears…',
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
  const resetDraft = () => {
    setTitle('');
    setCategoryIds([]);
    setRelatedIds([]);
    editor?.commands.clearContent(true);
    create.reset();
  };
  const close = () => {
    resetDraft();
    window.desktop?.closeQuickWindow();
    window.close();
  };
  const save = () => {
    if (!editor || !title.trim()) return;
    create.mutate(
      {
        title: title.trim(),
        contentJson: editor.getJSON(),
        categoryIds,
        relatedIds,
      },
      { onSuccess: () => close() },
    );
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetDraft();
        void categories.refetch();
        void noteList.refetch();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [categories, editor, noteList]);
  const setLink = () => {
    const href = window.prompt('Link URL');
    if (href)
      editor?.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };
  const tools: (Tool | 'divider')[] = editor
    ? [
        { icon: Undo2, label: 'Undo', run: () => editor.chain().focus().undo().run() },
        { icon: Redo2, label: 'Redo', run: () => editor.chain().focus().redo().run() },
        'divider',
        {
          icon: Heading1,
          label: 'Heading 1',
          active: () => editor.isActive('heading', { level: 1 }),
          run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          icon: Heading2,
          label: 'Heading 2',
          active: () => editor.isActive('heading', { level: 2 }),
          run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          icon: Bold,
          label: 'Bold',
          active: () => editor.isActive('bold'),
          run: () => editor.chain().focus().toggleBold().run(),
        },
        {
          icon: Italic,
          label: 'Italic',
          active: () => editor.isActive('italic'),
          run: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          icon: UnderlineIcon,
          label: 'Underline',
          active: () => editor.isActive('underline'),
          run: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
          icon: Strikethrough,
          label: 'Strike',
          active: () => editor.isActive('strike'),
          run: () => editor.chain().focus().toggleStrike().run(),
        },
        {
          icon: Highlighter,
          label: 'Highlight',
          active: () => editor.isActive('highlight'),
          run: () => editor.chain().focus().toggleHighlight().run(),
        },
        {
          icon: Link2,
          label: 'Link',
          active: () => editor.isActive('link'),
          run: setLink,
        },
        {
          icon: ImageIcon,
          label: 'Delete image',
          active: () => editor.isActive('image'),
          run: () => editor.chain().focus().deleteSelection().run(),
        },
        'divider',
        {
          icon: List,
          label: 'Bullet list',
          active: () => editor.isActive('bulletList'),
          run: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          icon: ListOrdered,
          label: 'Numbered list',
          active: () => editor.isActive('orderedList'),
          run: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          icon: Quote,
          label: 'Quote',
          active: () => editor.isActive('blockquote'),
          run: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          icon: Code,
          label: 'Code block',
          active: () => editor.isActive('codeBlock'),
          run: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          icon: AlignLeft,
          label: 'Align left',
          active: () => editor.isActive({ textAlign: 'left' }),
          run: () => editor.chain().focus().setTextAlign('left').run(),
        },
        {
          icon: AlignCenter,
          label: 'Align center',
          active: () => editor.isActive({ textAlign: 'center' }),
          run: () => editor.chain().focus().setTextAlign('center').run(),
        },
        {
          icon: AlignRight,
          label: 'Align right',
          active: () => editor.isActive({ textAlign: 'right' }),
          run: () => editor.chain().focus().setTextAlign('right').run(),
        },
        {
          icon: Table2,
          label: 'Insert table',
          run: () =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run(),
        },
        { icon: TableRowsSplit, label: 'Add row', run: () => editor.chain().focus().addRowAfter().run() },
        { icon: Trash2, label: 'Delete row', run: () => editor.chain().focus().deleteRow().run() },
        { icon: TableColumnsSplit, label: 'Add column', run: () => editor.chain().focus().addColumnAfter().run() },
        { icon: Trash2, label: 'Delete column', run: () => editor.chain().focus().deleteColumn().run() },
        { icon: TableProperties, label: 'Toggle header row', run: () => editor.chain().focus().toggleHeaderRow().run() },
        { icon: TableCellsMerge, label: 'Merge cells', run: () => editor.chain().focus().mergeCells().run() },
        { icon: TableCellsSplit, label: 'Split cell', run: () => editor.chain().focus().splitCell().run() },
        { icon: Trash2, label: 'Delete table', run: () => editor.chain().focus().deleteTable().run() },
      ]
    : [];
  return <main className="h-screen overflow-hidden bg-[#f7f8fc] p-3"><section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"><header className="window-drag flex h-14 shrink-0 items-center border-b px-4"><div><h1 className="m-0 text-sm font-semibold">Quick create</h1><p className="m-0 text-[11px] text-muted-foreground">Keep it useful, not perfect.</p></div><Button size="sm" className="window-no-drag ml-auto" onClick={save} disabled={create.isPending || !title.trim()}><Check size={15}/> {create.isPending ? 'Saving…' : 'Save memory'}</Button><button onClick={close} className="window-no-drag ml-2 rounded-lg border-0 bg-transparent p-2 text-muted-foreground hover:bg-muted" aria-label="Close"><X size={17} /></button></header>{create.isError && <ErrorMessage message={getApiErrorMessage(create.error)} className="mx-4 mt-3 px-3 py-2 text-xs" />}<Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 shrink-0 rounded-none border-0 border-b px-5 text-lg font-semibold shadow-none focus-visible:ring-0" placeholder="Memory title" /><div className="flex min-h-10 shrink-0 flex-wrap items-center gap-1 border-b bg-muted/30 px-3 py-1">{tools.map((tool, index) => tool === 'divider' ? <span key={index} className="mx-1 h-6 w-px bg-border" /> : <Button key={tool.label} type="button" title={tool.label} variant="ghost" size="icon" onClick={tool.run} className={cn('size-8', tool.active?.() && 'bg-accent text-accent-foreground')}><tool.icon size={15} /></Button>)}</div><EditorContent editor={editor} className="quick-editor min-h-0 flex-1 overflow-hidden px-5 py-3" /><div className="grid shrink-0 grid-cols-2 gap-3 border-t bg-muted/20 p-3"><div className="flex flex-col gap-1.5"><div className="flex h-8 items-center justify-between"><Label className="block text-xs">Categories</Label><CategoryFormDialog trigger={<Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs"><Plus size={13} /> New category</Button>} onSaved={(category) => { setCategoryIds((ids) => [...ids, category.id]); }} /></div><MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} placeholder="Choose one or more categories" maxVisible={1} searchKey="quick-categories" /></div><div className="flex flex-col gap-1.5"><div className="flex h-8 items-center"><Label className="block text-xs">Related memories</Label></div><MultiSelect options={relatedOptions} value={relatedIds} onChange={setRelatedIds} placeholder="Link existing memories" maxVisible={3} searchKey="quick-related" /></div></div><footer className="flex h-8 shrink-0 items-center px-4 text-[10px] text-muted-foreground"><span>Ctrl/⌘ + Enter save</span><span className="ml-auto">Esc close</span></footer></section></main>;
}
