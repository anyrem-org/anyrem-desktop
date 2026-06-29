import { Check } from "lucide-react";
import type { AvatarOption } from "../api/avatars.api";
import { avatarAssetUrl } from "../api/avatars.api";

export function AvatarItem({
  avatar,
  selected,
  disabled = false,
  onSelect,
}: {
  avatar: AvatarOption;
  selected: boolean;
  disabled?: boolean;
  onSelect: (avatar: AvatarOption) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || selected}
      onClick={() => onSelect(avatar)}
      className={`relative overflow-hidden rounded-md border bg-white p-1 transition disabled:cursor-not-allowed ${disabled && !selected ? "opacity-60" : ""} ${
        selected
          ? "border-primary shadow-sm ring-2 ring-primary/20"
          : "border-slate-200 hover:border-slate-300"
      }`}
      aria-pressed={selected}
      title={avatar.name}
    >
      <img
        src={avatarAssetUrl(avatar.filePath)}
        alt={avatar.name}
        className="aspect-square w-full rounded-md bg-slate-50 object-cover"
      />
      {selected ? (
        <span className="absolute right-1 top-1 grid size-3.5 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check size={9} />
        </span>
      ) : null}
    </button>
  );
}
