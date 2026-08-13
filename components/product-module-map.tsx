"use client";

import { useMemo } from "react";
import dagre from "dagre";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "reactflow";

type ProductSummary = {
  code: string;
  name: string;
  moduleCount: number;
};

type ProductNodeData = ProductSummary & { side: "left" | "right" };

const HUB_ID = "core-connect-hub";
const HUB_WIDTH = 210;
const HUB_HEIGHT = 84;
const PRODUCT_WIDTH = 184;
const PRODUCT_HEIGHT = 72;

function HubNode() {
  return (
    <div className="w-[210px] rounded-2xl border border-emerald-300 bg-emerald-700 px-5 py-4 text-center text-white shadow-xl shadow-emerald-950/20">
      <Handle id="left" type="source" position={Position.Left} className="!h-2 !w-2 !border-emerald-200 !bg-emerald-50" />
      <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">Merkez</span>
      <strong className="mt-1 block text-base font-bold">Core + Connect</strong>
      <Handle id="right" type="source" position={Position.Right} className="!h-2 !w-2 !border-emerald-200 !bg-emerald-50" />
    </div>
  );
}

function ProductNode({ data }: NodeProps<ProductNodeData>) {
  return (
    <div className="w-[184px] rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-sky-950 shadow-lg shadow-sky-950/10">
      <Handle
        type="target"
        position={data.side === "left" ? Position.Right : Position.Left}
        className="!h-2 !w-2 !border-sky-300 !bg-sky-600"
      />
      <strong className="block truncate text-sm font-bold" title={data.name}>{data.name}</strong>
      <span className="mt-1 block text-xs font-medium text-sky-700">{data.moduleCount} modül</span>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  hub: HubNode,
  product: ProductNode,
};

function layoutBranch(products: ProductSummary[], direction: "LR" | "RL", side: "left" | "right") {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    ranksep: 170,
    nodesep: 28,
    marginx: 0,
    marginy: 0,
  });
  graph.setNode(HUB_ID, { width: HUB_WIDTH, height: HUB_HEIGHT });

  products.forEach((product) => {
    graph.setNode(product.code, { width: PRODUCT_WIDTH, height: PRODUCT_HEIGHT });
    graph.setEdge(HUB_ID, product.code);
  });

  dagre.layout(graph);
  const hub = graph.node(HUB_ID);
  const hubLeft = hub.x - HUB_WIDTH / 2;
  const hubTop = hub.y - HUB_HEIGHT / 2;

  return products.map<Node<ProductNodeData>>((product) => {
    const positioned = graph.node(product.code);
    return {
      id: product.code,
      type: "product",
      position: {
        x: positioned.x - PRODUCT_WIDTH / 2 - hubLeft,
        y: positioned.y - PRODUCT_HEIGHT / 2 - hubTop,
      },
      data: { ...product, side },
    };
  });
}

function createMap(products: ProductSummary[]) {
  const leftProducts = products.filter((_, index) => index % 2 === 0);
  const rightProducts = products.filter((_, index) => index % 2 === 1);
  const leftNodes = layoutBranch(leftProducts, "RL", "left");
  const rightNodes = layoutBranch(rightProducts, "LR", "right");

  const nodes: Node[] = [
    {
      id: HUB_ID,
      type: "hub",
      position: { x: 0, y: 0 },
      data: {},
    },
    ...leftNodes,
    ...rightNodes,
  ];

  const edges: Edge[] = products.map((product, index) => {
    const side = index % 2 === 0 ? "left" : "right";
    return {
      id: `hub-${product.code}`,
      source: HUB_ID,
      sourceHandle: side,
      target: product.code,
      type: "smoothstep",
      style: { stroke: "#94a3b8", strokeWidth: 1.15 },
    };
  });

  return { nodes, edges };
}

export function ProductModuleMap({ products }: { products: ProductSummary[] }) {
  const { nodes, edges } = useMemo(() => createMap(products), [products]);

  return (
    <section className="map-frame" aria-label="OnSuite ürün ve modül haritası">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.3, maxZoom: 1 }}
        minZoom={0.25}
        maxZoom={1.8}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        panOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        preventScrolling
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#d7e0db" gap={24} size={1} />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </section>
  );
}
