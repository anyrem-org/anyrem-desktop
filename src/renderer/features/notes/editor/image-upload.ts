import type { Editor } from "@tiptap/react";
import { uploadImage } from "../../uploads/uploads.api";

export const pasteImages = (editor: Editor, event: ClipboardEvent) => {
  const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
    file.type.startsWith("image/"),
  );
  if (!files.length) return false;
  event.preventDefault();
  void insertImages(editor, files);
  return true;
};

export const insertImages = (editor: Editor, files: File[]) =>
  Promise.all(files.map(fileToDataUrl))
    .then((images) =>
      Promise.all(
        images.map((dataUrl, index) =>
          uploadImage({ dataUrl, name: files[index]?.name ?? "image" }),
        ),
      ),
    )
    .then((uploads) => {
      uploads.forEach(({ url }, index) => {
        editor
          .chain()
          .focus()
          .insertContent({ type: "image", attrs: { src: url, alt: files[index]?.name ?? "" } })
          .run();
      });
    });

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
