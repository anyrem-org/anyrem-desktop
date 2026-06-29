import { useEffect, useState } from "react";
import { ErrorMessage } from "../../../shared/components/ErrorMessage";
import { getApiErrorMessage } from "../../../shared/lib/api-client";
import type { AvatarOption } from "../api/avatars.api";
import { useAvatars, useAvatarStyles } from "../hooks/useAvatars";
import { AvatarGrid } from "./AvatarGrid";
import { AvatarStyleTabs } from "./AvatarStyleTabs";

export function AvatarPicker({
  value,
  initialStyle,
  disabled = false,
  onChange,
}: {
  value?: string | null;
  initialStyle?: string | null;
  disabled?: boolean;
  onChange: (avatar: AvatarOption) => void;
}) {
  const styles = useAvatarStyles();
  const [style, setStyle] = useState(initialStyle ?? "");
  useEffect(() => {
    if (style) return;
    if (initialStyle) setStyle(initialStyle);
    else if (styles.data?.[0]?.style) setStyle(styles.data[0].style);
  }, [initialStyle, style, styles.data]);
  const avatars = useAvatars(style || undefined);

  return (
    <div className="space-y-4">
      {styles.isError ? (
        <ErrorMessage message={getApiErrorMessage(styles.error)} />
      ) : null}
      {styles.data ? (
        <AvatarStyleTabs styles={styles.data} value={style} onChange={setStyle} />
      ) : null}
      {avatars.isPending ? (
        <p className="text-sm text-muted-foreground">Loading avatars...</p>
      ) : avatars.isError ? (
        <ErrorMessage message={getApiErrorMessage(avatars.error)} />
      ) : avatars.data?.length ? (
        <AvatarGrid
          avatars={avatars.data}
          selectedId={value}
          disabled={disabled}
          onSelect={onChange}
        />
      ) : (
        <p className="text-sm text-muted-foreground">No avatars in this style.</p>
      )}
    </div>
  );
}
