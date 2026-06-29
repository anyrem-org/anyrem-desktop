import type { AvatarStyle } from "../api/avatars.api";
import { Button } from "../../../shared/components/ui/button";

export function AvatarStyleTabs({
  styles,
  value,
  onChange,
}: {
  styles: AvatarStyle[];
  value?: string;
  onChange: (style: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {styles.map((style) => (
        <Button
          key={style.style}
          type="button"
          size="sm"
          variant={value === style.style ? "default" : "outline"}
          onClick={() => onChange(style.style)}
        >
          {style.styleName} ({style.count})
        </Button>
      ))}
    </div>
  );
}
