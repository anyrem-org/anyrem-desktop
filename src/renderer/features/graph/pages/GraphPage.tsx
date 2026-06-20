import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes: Node[] = [
  {
    id: "memory",
    position: { x: 330, y: 180 },
    data: { label: "Remember Anything" },
    style: {
      background: "#5b5ce2",
      color: "white",
      border: 0,
      borderRadius: 18,
      padding: 18,
      fontWeight: 700,
    },
  },
  ...[
    ["electron", 70, 40],
    ["search", 580, 30],
    ["product", 70, 350],
    ["recap", 590, 350],
    ["editor", 330, 420],
  ].map(([id, x, y]) => ({
    id: String(id),
    position: { x: Number(x), y: Number(y) },
    data: { label: String(id)[0].toUpperCase() + String(id).slice(1) },
    style: {
      border: "1px solid #dfe2f0",
      borderRadius: 14,
      padding: 14,
      background: "white",
    },
  })),
];
const edges: Edge[] = nodes
  .slice(1)
  .map((node) => ({
    id: `e-${node.id}`,
    source: "memory",
    target: node.id,
    animated: node.id === "search",
    style: { stroke: "#a5b4fc" },
  }));

export function GraphPage() {
  return (
    <div className="flex h-full flex-col p-8">
      <div>
        <h2 className="mb-1 text-2xl">Knowledge graph</h2>
        <p className="mt-0 text-sm text-slate-400">
          See how your categories connect.
        </p>
      </div>
      <div className="mt-5 min-h-0 flex-1 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#e2e8f0" gap={24} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
