import type { AvatarOption } from "../api/avatars.api";
import { AvatarItem } from "./AvatarItem";

export function AvatarGrid({
  avatars,
  selectedId,
  disabled = false,
  onSelect,
}: {
  avatars: AvatarOption[];
  selectedId?: string | null;
  disabled?: boolean;
  onSelect: (avatar: AvatarOption) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 md:grid-cols-10 lg:grid-cols-12">
      {avatars.map((avatar) => (
        <AvatarItem
          key={avatar.id}
          avatar={avatar}
          selected={avatar.id === selectedId}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
