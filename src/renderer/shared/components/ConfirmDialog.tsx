import { useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function ConfirmDialog({ trigger, title, description, confirmLabel = "Confirm", pending = false, destructive = true, onConfirm }: { trigger: ReactNode; title: string; description: string; confirmLabel?: string; pending?: boolean; destructive?: boolean; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  const confirm = () => { onConfirm(); setOpen(false); };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" variant={destructive ? "destructive" : "default"} disabled={pending} onClick={confirm}>{pending ? "Working…" : confirmLabel}</Button></div>
      </DialogContent>
    </Dialog>
  );
}
