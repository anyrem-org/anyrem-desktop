import { codeBlockOptions } from '@blocknote/code-block';
import { BlockNoteSchema, createCodeBlockSpec, type Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import { useCallback, useEffect } from 'react';
import { uploadImage } from '../../uploads/uploads.api';

import '@blocknote/shadcn/style.css';

export type NoteBlocks = Block<any, any, any>[];

const supportedImageTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

const dataUrlOf = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'));
    reader.readAsDataURL(file);
  });

type Props = {
  initialBlocks?: NoteBlocks;
  legacyHtml?: string;
  onChange?: (blocks: NoteBlocks) => void;
  className?: string;
  editable?: boolean;
};

export function BlockNoteEditor({
  initialBlocks,
  legacyHtml,
  onChange,
  className,
  editable = true,
}: Props) {
  const uploadFile = useCallback(async (file: File) => {
    if (!supportedImageTypes.has(file.type))
      throw new Error('Only PNG, JPEG, WebP, and GIF images are supported.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');
    const { url } = await uploadImage({ dataUrl: await dataUrlOf(file), name: file.name });
    return url;
  }, []);

  const editor = useCreateBlockNote(
    {
      initialContent: (initialBlocks ?? [
        { type: 'heading', props: { level: 1 } },
        { type: 'paragraph' },
      ]) as never,
      uploadFile,
      schema: BlockNoteSchema.create().extend({
        blockSpecs: {
          codeBlock: createCodeBlockSpec(codeBlockOptions),
        },
      }),
    },
    [initialBlocks, uploadFile],
  );
  const handleChange = useCallback(() => onChange?.(editor.document), [editor, onChange]);

  useEffect(() => {
    if (onChange) handleChange();
  }, [handleChange, onChange]);

  useEffect(() => {
    if (!legacyHtml) return;
    const blocks = editor.tryParseHTMLToBlocks(legacyHtml);
    editor.replaceBlocks(
      editor.document,
      (blocks.length ? blocks : [{ type: 'paragraph' }]) as never,
    );
  }, [editor, legacyHtml]);

  return (
    <BlockNoteView
      editor={editor}
      onChange={onChange ? handleChange : undefined}
      className={`${className ?? ''}`}
      theme="light"
      editable={editable}
    />
  );
}

export const titleOf = (blocks: NoteBlocks) => inlineText(blocks[0]?.content).trim();

const inlineText = (content: unknown): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const value = item as { text?: string; content?: unknown };
      return value.text ?? inlineText(value.content);
    })
    .join('');
};
