import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  FileText,
  Folder,
  Layers3,
  Link2,
  Maximize2,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { categories, getMemoryGraphRelations, notes } from "../api/graph.api";
import { GraphInspector } from "../components/GraphInspector";

type Filter = "all" | "category" | "note";
const categoryPositions = [
  { x: 40, y: 40 },
  { x: 620, y: 40 },
  { x: 330, y: 0 },
  { x: 650, y: 470 },
  { x: 30, y: 470 },
];
const notePositions = [
  { x: 180, y: 190 },
  { x: 550, y: 185 },
  { x: 350, y: 260 },
  { x: 540, y: 390 },
  { x: 170, y: 390 },
];

export function GraphPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showRelated, setShowRelated] = useState(true);
  const [selectedId, setSelectedId] = useState<string>();
  const [instance, setInstance] = useState<ReactFlowInstance>();
  const graph = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase();
    const categoryNodes: Node[] = categories.map((category, index) => {
      const count = notes.filter((note) =>
        note.categoryIds.includes(category.id),
      ).length;
      const match =
        !keyword ||
        `${category.name} ${category.description}`
          .toLocaleLowerCase()
          .includes(keyword);
      return {
        id: `category-${category.id}`,
        position: categoryPositions[index] ?? { x: index * 220, y: 50 },
        data: {
          kind: "category",
          entityId: category.id,
          label: (
            <div className="flex items-center gap-3 text-left">
              <span
                className="grid size-9 place-items-center rounded-xl"
                style={{
                  background: `${category.color}18`,
                  color: category.color,
                }}
              >
                <Folder size={17} />
              </span>
              <span>
                <strong className="block text-sm">{category.name}</strong>
                <span className="text-[11px] text-slate-400">
                  {count} memories
                </span>
              </span>
            </div>
          ),
        },
        style: {
          width: 180,
          border:
            selectedId === `category-${category.id}`
              ? `2px solid ${category.color}`
              : "1px solid #dfe3ee",
          borderRadius: 16,
          padding: 12,
          background: "#fff",
          boxShadow:
            selectedId === `category-${category.id}`
              ? `0 0 0 4px ${category.color}18`
              : "0 8px 24px rgba(15,23,42,.06)",
          opacity: match ? 1 : 0.18,
        },
      };
    });
    const noteNodes: Node[] = notes.map((note, index) => {
      const match =
        !keyword ||
        `${note.title} ${note.content} ${note.category}`
          .toLocaleLowerCase()
          .includes(keyword);
      return {
        id: `note-${note.id}`,
        position: notePositions[index] ?? { x: 220 + index * 180, y: 260 },
        data: {
          kind: "note",
          entityId: note.id,
          label: (
            <div className="text-left">
              <div className="mb-2 flex items-center gap-2">
                <FileText size={14} style={{ color: note.categoryColor }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: note.categoryColor }}
                >
                  {note.category}
                </span>
              </div>
              <strong className="line-clamp-2 block text-xs leading-5">
                {note.title}
              </strong>
              <span className="mt-2 block text-[10px] text-slate-400">
                {note.relatedIds.length} links · {note.updatedAt}
              </span>
            </div>
          ),
        },
        style: {
          width: 210,
          border:
            selectedId === `note-${note.id}`
              ? "2px solid #5b5ce2"
              : "1px solid #e2e5ef",
          borderRadius: 14,
          padding: 12,
          background: "#fff",
          boxShadow:
            selectedId === `note-${note.id}`
              ? "0 0 0 4px rgba(91,92,226,.12)"
              : "0 6px 18px rgba(15,23,42,.05)",
          opacity: match ? 1 : 0.18,
        },
      };
    });
    const visibleNodes =
      filter === "all"
        ? [...categoryNodes, ...noteNodes]
        : filter === "category"
          ? categoryNodes
          : noteNodes;
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    const edges: Edge[] = getMemoryGraphRelations()
      .filter(
        (relation) =>
          visibleIds.has(relation.source) &&
          visibleIds.has(relation.target) &&
          (showRelated || relation.type !== "related"),
      )
      .map((relation) => {
        const active =
          selectedId === relation.source || selectedId === relation.target;
        const category =
          relation.type === "contains"
            ? categories.find(
                (item) => relation.source === `category-${item.id}`,
              )
            : undefined;
        return {
          id: relation.id,
          source: relation.source,
          target: relation.target,
          type: "smoothstep",
          animated: relation.type === "related" && active,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 14,
            height: 14,
            color:
              relation.type === "related"
                ? "#a855f7"
                : (category?.color ?? "#94a3b8"),
          },
          style: {
            stroke:
              relation.type === "related"
                ? "#a855f7"
                : (category?.color ?? "#94a3b8"),
            strokeWidth: active ? 2.5 : 1.3,
            strokeDasharray: relation.type === "related" ? "6 5" : undefined,
            opacity: selectedId && !active ? 0.18 : 0.7,
          },
        };
      });
    return { nodes: visibleNodes, edges };
  }, [filter, query, selectedId, showRelated]);
  return (
    <div className="flex h-full min-h-[700px] flex-col p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl">Knowledge explorer</h2>
          <p className="m-0 text-sm text-muted-foreground">
            Trace categories, memories and the links between them.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{categories.length} categories</span>
          <span>·</span>
          <span>{notes.length} memories</span>
          <span>·</span>
          <span>{getMemoryGraphRelations().length} relations</span>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        <div className="relative min-w-52 flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={15}
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find node or content..."
            className="h-9 border-0 bg-muted/60 pl-9 shadow-none focus-visible:ring-1"
          />
        </div>
        <div className="h-6 w-px bg-border" />
        {(["all", "category", "note"] as Filter[]).map((item) => (
          <Button
            key={item}
            size="sm"
            variant={filter === item ? "default" : "ghost"}
            onClick={() => setFilter(item)}
          >
            {item === "all" ? (
              <Layers3 size={14} />
            ) : item === "category" ? (
              <Folder size={14} />
            ) : (
              <FileText size={14} />
            )}{" "}
            {item === "all"
              ? "All"
              : item === "category"
                ? "Categories"
                : "Memories"}
          </Button>
        ))}
        <Button
          size="sm"
          variant={showRelated ? "secondary" : "ghost"}
          onClick={() => setShowRelated(!showRelated)}
        >
          <Link2 size={14} /> Related links
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-9"
          title="Fit graph"
          onClick={() => instance?.fitView({ padding: 0.2, duration: 350 })}
        >
          <Maximize2 size={15} />
        </Button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-[#f8f9fd] shadow-sm">
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          onInit={setInstance}
          onNodeClick={(_event, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(undefined)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.35}
          maxZoom={1.8}
        >
          <Background color="#dfe3ef" gap={22} size={1} />
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor={(node) =>
              node.id.startsWith("category-") ? "#a5b4fc" : "#e2e8f0"
            }
            maskColor="rgba(248,249,253,.72)"
          />
        </ReactFlow>
        <div className="pointer-events-none absolute bottom-4 left-16 z-10 flex items-center gap-4 rounded-xl border bg-white/90 px-3 py-2 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
          <span className="flex items-center gap-1.5">
            <i className="block h-px w-6 bg-indigo-400" /> category membership
          </span>
          <span className="flex items-center gap-1.5">
            <i className="block w-6 border-t border-dashed border-purple-500" />{" "}
            related memory
          </span>
        </div>
        <GraphInspector
          nodeId={selectedId}
          onClose={() => setSelectedId(undefined)}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
