import { Check, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { MultiSelect } from '../../../shared/components/MultiSelect';
import { Button } from '../../../shared/components/ui/button';
import { Label } from '../../../shared/components/ui/label';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { CategoryFormDialog } from '../../categories/components/CategoryFormDialog';
import { useGetCategories } from '../../categories/hooks/useCategories';
import { BlockNoteEditor, type NoteBlocks, titleOf } from '../../notes/components/BlockNoteEditor';
import { useCreateNote, useGetNotes } from '../../notes/hooks/useNotes';

export function QuickCreatePage() {
  const categories = useGetCategories();
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const create = useCreateNote();
  const [blocks, setBlocks] = useState<NoteBlocks>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const title = titleOf(blocks);
  const dismiss = () => window.desktop?.closeQuickWindow();
  const save = () =>
    title &&
    create.mutate(
      { title, contentJson: blocks, editorFormat: 'BLOCKNOTE', categoryIds, relatedIds },
      { onSuccess: dismiss },
    );
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  return (
    <main className="h-screen overflow-hidden bg-[#f7f8fc] p-3">
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl">
        <header className="window-drag flex h-14 shrink-0 items-center border-b px-4">
          <div>
            <h1 className="m-0 text-sm font-semibold">Quick create</h1>
            <p className="m-0 text-[11px] text-muted-foreground">
              Start with Heading 1 — it becomes the title.
            </p>
          </div>
          <Button
            size="sm"
            className="window-no-drag ml-auto"
            onClick={save}
            disabled={create.isPending || !title}
          >
            <Check size={15} /> {create.isPending ? 'Saving…' : 'Save memory'}
          </Button>
          <button
            onClick={dismiss}
            className="window-no-drag ml-2 rounded-lg border-0 bg-transparent p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </header>
        {create.isError && (
          <ErrorMessage
            message={getApiErrorMessage(create.error)}
            className="mx-4 mt-3 px-3 py-2 text-xs"
          />
        )}
        <div className="grid shrink-0 grid-cols-2 gap-3 border-b bg-muted/20 p-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex h-8 items-center justify-between">
              <Label className="block text-xs">Categories</Label>
              <CategoryFormDialog
                trigger={
                  <Button type="button" variant="ghost" size="sm" className="h-8 px-2.5 text-xs">
                    <Plus size={13} /> New category
                  </Button>
                }
                onSaved={(category) => setCategoryIds((ids) => [...ids, category.id])}
              />
            </div>
            <MultiSelect
              options={(categories.data ?? []).map((item) => ({
                value: item.id,
                label: item.name,
                color: item.color,
                description: item.description,
              }))}
              value={categoryIds}
              onChange={setCategoryIds}
              placeholder="Choose categories"
              maxVisible={1}
              searchKey="quick-categories"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex h-8 items-center">
              <Label className="block text-xs">Related memories</Label>
            </div>
            <MultiSelect
              options={(noteList.data?.items ?? []).map((item) => ({
                value: item.id,
                label: item.title,
                description: item.category,
              }))}
              value={relatedIds}
              onChange={setRelatedIds}
              placeholder="Link memories"
              maxVisible={3}
              searchKey="quick-related"
            />
          </div>
        </div>
        <BlockNoteEditor
          onChange={setBlocks}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-3"
        />
        <footer className="flex h-8 shrink-0 items-center px-4 text-[10px] text-muted-foreground">
          <span>Ctrl/⌘ + Enter save</span>
          <span className="ml-auto">Esc close</span>
        </footer>
      </section>
    </main>
  );
}
