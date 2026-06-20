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
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, Code, Heading1, Heading2, Highlighter, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough, Table2, Underline as UnderlineIcon, Undo2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MultiSelect } from '../../../shared/components/MultiSelect';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { cn } from '../../../shared/lib/utils';
import { categories, searchCategories } from '../../categories/api/categories.api';
import { notes, searchRelatedNotes } from '../../notes/api/notes.api';

const categoryOptions = categories.map((item) => ({value: item.id, label: item.name, color: item.color, description: item.description}));
const relatedOptions = notes.map((item) => ({value: item.id, label: item.title, description: item.category}));
const searchCategoryOptions = async (query: string) => (await searchCategories(query)).map((item) => ({value: item.id, label: item.name, color: item.color, description: item.description}));
const searchRelatedOptions = async (query: string) => (await searchRelatedNotes(query)).map((item) => ({value: item.id, label: item.title, description: item.category}));

export function QuickCreatePage() {
  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const editor = useEditor({extensions: [StarterKit, Underline, Highlight, Link.configure({openOnClick: false}), TextAlign.configure({types: ['heading', 'paragraph']}), Placeholder.configure({placeholder: 'Write the useful part...' }), Table.configure({resizable: true}), TableRow, TableHeader, TableCell]});
  const save = () => { if (!editor?.getText().trim()) return; window.desktop?.saveQuickNote({title: title.trim() || 'Untitled memory', content: editor.getHTML(), categoryIds, relatedIds}); };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') window.desktop?.closeQuickWindow();
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); save(); }
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  });
  const setLink = () => { const href = window.prompt('Link URL'); if (href) editor?.chain().focus().extendMarkRange('link').setLink({href}).run(); };
  const tools = editor ? [
    [Undo2, 'Undo', false, () => editor.chain().focus().undo().run()],
    [Redo2, 'Redo', false, () => editor.chain().focus().redo().run()],
    [Heading1, 'Heading 1', editor.isActive('heading', {level: 1}), () => editor.chain().focus().toggleHeading({level: 1}).run()],
    [Heading2, 'Heading 2', editor.isActive('heading', {level: 2}), () => editor.chain().focus().toggleHeading({level: 2}).run()],
    [Bold, 'Bold', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run()],
    [Italic, 'Italic', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run()],
    [UnderlineIcon, 'Underline', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run()],
    [Strikethrough, 'Strike', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run()],
    [Highlighter, 'Highlight', editor.isActive('highlight'), () => editor.chain().focus().toggleHighlight().run()],
    [Link2, 'Link', editor.isActive('link'), setLink],
    [List, 'Bullet list', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run()],
    [ListOrdered, 'Numbered list', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run()],
    [Quote, 'Quote', editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run()],
    [Code, 'Code block', editor.isActive('codeBlock'), () => editor.chain().focus().toggleCodeBlock().run()],
    [AlignLeft, 'Align left', editor.isActive({textAlign: 'left'}), () => editor.chain().focus().setTextAlign('left').run()],
    [AlignCenter, 'Align center', editor.isActive({textAlign: 'center'}), () => editor.chain().focus().setTextAlign('center').run()],
    [AlignRight, 'Align right', editor.isActive({textAlign: 'right'}), () => editor.chain().focus().setTextAlign('right').run()],
    [Table2, 'Table', editor.isActive('table'), () => editor.chain().focus().insertTable({rows: 3, cols: 3, withHeaderRow: true}).run()],
  ] as const : [];
  return <main className="h-screen overflow-hidden bg-[#f7f8fc] p-3"><section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"><header className="window-drag flex h-14 shrink-0 items-center border-b px-4"><div><h1 className="m-0 text-sm font-semibold">Quick create</h1><p className="m-0 text-[11px] text-muted-foreground">Rich capture without opening the full app.</p></div><Button size="sm" className="window-no-drag ml-auto" onClick={save} disabled={!editor?.getText().trim()}><Check size={15}/> Save</Button><button onClick={() => window.desktop?.closeQuickWindow()} className="window-no-drag ml-2 rounded-lg border-0 bg-transparent p-2 text-muted-foreground hover:bg-muted" aria-label="Close"><X size={17}/></button></header><Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} className="h-12 shrink-0 rounded-none border-0 border-b px-5 text-lg font-semibold shadow-none focus-visible:ring-0" placeholder="Memory title"/><div className="flex h-10 shrink-0 items-center gap-1 border-b bg-muted/30 px-3">{tools.map(([Icon, label, active, run]) => <Button key={label} type="button" title={label} variant="ghost" size="icon" onClick={run} className={cn('size-8', active && 'bg-accent text-accent-foreground')}><Icon size={15}/></Button>)}</div><EditorContent editor={editor} className="quick-editor min-h-0 flex-1 overflow-hidden px-5 py-3"/><div className="grid shrink-0 grid-cols-2 gap-3 border-t bg-muted/20 p-3"><div><Label className="mb-1.5 block text-xs">Categories</Label><MultiSelect options={categoryOptions} value={categoryIds} onChange={setCategoryIds} placeholder="Optional categories" maxVisible={1} searchKey="quick-categories" onSearch={searchCategoryOptions}/></div><div><Label className="mb-1.5 block text-xs">Related memories</Label><MultiSelect options={relatedOptions} value={relatedIds} onChange={setRelatedIds} placeholder="Link memories" maxVisible={1} searchKey="quick-related" onSearch={searchRelatedOptions}/></div></div><footer className="flex h-8 shrink-0 items-center px-4 text-[10px] text-muted-foreground"><span>Ctrl/⌘ + Enter save</span><span className="ml-auto">Esc close</span></footer></section></main>;
}
