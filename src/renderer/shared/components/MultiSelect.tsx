import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export type SelectOption = {
  value: string;
  label: string;
  color?: string;
  description?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
  maxVisible = 3,
  searchKey,
  onSearch,
}: {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  maxVisible?: number;
  searchKey?: string;
  onSearch?: (query: string) => Promise<SelectOption[]>;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { data, isFetching } = useQuery({
    queryKey: ["multi-select", searchKey, deferredQuery],
    queryFn: () => onSearch!(deferredQuery),
    enabled: Boolean(onSearch),
    staleTime: 30_000,
  });
  const selected = options.filter((option) => value.includes(option.value));
  const visible = onSearch
    ? (data ?? options)
    : options.filter((option) =>
        `${option.label} ${option.description ?? ""}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
      );
  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between font-normal text-muted-foreground"
          >
            {placeholder}
            <ChevronsUpDown size={15} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          avoidCollisions={false}
          className="w-[var(--radix-popover-trigger-width)] p-2"
        >
          <div className="relative mb-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search on server..."
              className="h-9 pl-8 pr-8"
            />
            {isFetching && (
              <Loader2
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
                size={14}
              />
            )}
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {visible.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={value.includes(option.value)}
                tabIndex={0}
                onClick={() => toggle(option.value)}
                onKeyDown={(event) =>
                  event.key === "Enter" && toggle(option.value)
                }
                className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 outline-none hover:bg-accent focus:bg-accent"
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  className="pointer-events-none mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </span>
                {option.color && (
                  <span
                    className="ml-auto mt-1 size-2 rounded-full"
                    style={{ background: option.color }}
                  />
                )}
              </div>
            ))}
            {!isFetching && !visible.length && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No results.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {!!selected.length && (
        <div className="flex min-h-7 flex-wrap items-center gap-1.5">
          {selected.slice(0, maxVisible).map((option) => (
            <Badge
              key={option.value}
              className="gap-1 bg-accent text-accent-foreground"
            >
              <span className="max-w-36 truncate">{option.label}</span>
              <button
                type="button"
                onClick={() => toggle(option.value)}
                className="rounded-full border-0 bg-transparent p-0.5 hover:bg-white/70"
                aria-label={`Remove ${option.label}`}
              >
                <X size={11} />
              </button>
            </Badge>
          ))}
          {selected.length > maxVisible && (
            <Badge>+{selected.length - maxVisible} more</Badge>
          )}
        </div>
      )}
    </div>
  );
}
