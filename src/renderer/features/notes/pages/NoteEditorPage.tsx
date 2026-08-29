import { ArrowLeft, PanelRightClose, PanelRightOpen, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { MultiSelect } from '../../../shared/components/MultiSelect';
import { Button } from '../../../shared/components/ui/button';
import { Label } from '../../../shared/components/ui/label';
import { getApiErrorMessage } from '../../../shared/lib/api-client';
import { useUiStore } from '../../../shared/store/ui.store';
import { CategoryFormDialog } from '../../categories/components/CategoryFormDialog';
import { useGetCategories } from '../../categories/hooks/useCategories';
import { BlockNoteEditor, type NoteBlocks, titleOf } from '../components/BlockNoteEditor';
import { useCreateNote, useGetNote, useGetNotes, useUpdateNote } from '../hooks/useNotes';

export function NoteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<NoteBlocks>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const existing = useGetNote(id);
  const categories = useGetCategories();
  const noteList = useGetNotes({ page: 1, limit: 100 });
  const create = useCreateNote();
  const update = useUpdateNote();
  const setActivityOpen = useUiStore((state) => state.setActivityOpen);
  const title = titleOf(blocks);
  const fallbackTitle = existing.data?.title;

  useEffect(() => setActivityOpen(false), [setActivityOpen]);
  useEffect(() => {
    if (!existing.data) return;
    setCategoryIds(existing.data.categoryIds);
    setRelatedIds(existing.data.relatedIds);
  }, [existing.data]);

  const save = () => {
    if (!title && !fallbackTitle) return;
    const input = {
      title: title || fallbackTitle!,
      contentJson: blocks,
      editorFormat: 'BLOCKNOTE' as const,
      categoryIds,
      relatedIds,
    };

    if (id) {
      update.mutate({ id, input }, { onSuccess: (note: { id: string }) => {} });
    } else {
      create.mutate(input, {
        onSuccess: (note) => {
          navigate(`/notes/${note.id}/edit`, { replace: true });
        },
      });
    }
  };
  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/search'));
  const mutation = id ? update : create;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-14 shrink-0 items-center border-b px-8">
        <Button type="button" variant="ghost" onClick={goBack} className="text-muted-foreground">
          <ArrowLeft size={16} /> Back
        </Button>
        <span className="ml-3 text-xs text-muted-foreground">
          {id ? 'Editing memory' : 'New memory'}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setDetailsOpen((open) => !open)}
          aria-label={detailsOpen ? 'Hide note details' : 'Show note details'}
          title={detailsOpen ? 'Hide note details' : 'Show note details'}
          className="ml-auto mr-2 text-muted-foreground"
        >
          {detailsOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </Button>
        <Button onClick={save} disabled={mutation.isPending || (!title && !fallbackTitle)}>
          <Save size={16} /> {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {mutation.isError && (
        <ErrorMessage message={getApiErrorMessage(mutation.error)} className="mb-4 shrink-0" />
      )}
      {existing.isError && (
        <ErrorMessage message={getApiErrorMessage(existing.error)} className="mb-4 shrink-0" />
      )}
      {id && existing.isPending && (
        <div className="shrink-0 p-8 text-sm text-muted-foreground">Loading memory…</div>
      )}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <BlockNoteEditor
            initialBlocks={
              existing.data?.editorFormat === 'BLOCKNOTE' &&
              Array.isArray(existing.data.contentJson)
                ? (existing.data.contentJson as NoteBlocks)
                : undefined
            }
            legacyHtml={
              existing.data?.editorFormat === 'TIPTAP' ? existing.data.contentHtml : undefined
            }
            onChange={setBlocks}
            className="mx-auto min-h-full max-w-4xl px-8 py-10"
          />
        </div>
        {detailsOpen && (
          <aside className="scrollbar w-80 shrink-0 overflow-y-auto border-l bg-muted/20">
            <div className="sticky top-0 border-b bg-background/95 px-5 py-4 backdrop-blur">
              <h2 className="m-0 text-sm font-semibold">Note details</h2>
              <p className="mb-0 mt-1 text-xs text-muted-foreground">
                Organize and connect this memory.
              </p>
            </div>
            <div className="space-y-5 p-5">
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Categories</Label>
                  <CategoryFormDialog
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs!"
                      >
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
                  searchKey="categories"
                />
              </section>
              <section className="space-y-2">
                <Label className="text-xs">Related memories</Label>
                <MultiSelect
                  options={(noteList.data?.items ?? [])
                    .filter((item) => item.id !== id)
                    .map((item) => ({
                      value: item.id,
                      label: item.title,
                      description: item.category,
                    }))}
                  value={relatedIds}
                  onChange={setRelatedIds}
                  placeholder="Link memories"
                  maxVisible={3}
                  searchKey="related-memories"
                />
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
