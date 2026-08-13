"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  type ReactFlowInstance,
} from "reactflow";

type ProductSummary = {
  code: string;
  name: string;
  moduleCount: number;
};

type ModuleSummary = {
  productCode: string;
  code: string;
  name: string;
  completePercentage: number | null;
  status: "live" | "planned";
  draft: boolean;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  sharedProducts: string[];
};

type ProductNodeData = ProductSummary & {
  side: "left" | "right";
  expanded: boolean;
  onToggle: (productCode: string) => void;
};

type ModuleNodeData = ModuleSummary & {
  side: "left" | "right";
  onOpenModule: (module: ModuleSummary) => void;
};

const HUB_ID = "core-connect-hub";
const HUB_WIDTH = 210;
const HUB_HEIGHT = 84;
const PRODUCT_WIDTH = 184;
const PRODUCT_HEIGHT = 72;
const MODULE_WIDTH = 210;
const MODULE_HEIGHT = 78;

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
    <div className={`w-[184px] rounded-2xl border bg-sky-50 text-center text-sky-950 shadow-lg shadow-sky-950/10 transition ${data.expanded ? "border-sky-500 ring-4 ring-sky-200" : "border-sky-200"}`}>
      <Handle
        type="target"
        position={data.side === "left" ? Position.Right : Position.Left}
        className="!h-2 !w-2 !border-sky-300 !bg-sky-600"
      />
      <button
        type="button"
        className="nodrag nopan block w-full cursor-pointer rounded-2xl px-4 py-3"
        aria-expanded={data.expanded}
        aria-label={`${data.name}: ${data.moduleCount} modül. ${data.expanded ? "Modülleri kapat" : "Modülleri aç"}`}
        onClick={() => data.onToggle(data.code)}
      >
        <strong className="block truncate text-sm font-bold" title={data.name}>{data.name}</strong>
        <span className="mt-1 block text-xs font-medium text-sky-700">{data.moduleCount} modül</span>
      </button>
      <Handle
        id="modules"
        type="source"
        position={data.side === "left" ? Position.Left : Position.Right}
        className="!h-2 !w-2 !border-sky-300 !bg-sky-600"
      />
    </div>
  );
}

function ModuleNode({ data }: NodeProps<ModuleNodeData>) {
  const percentage = data.completePercentage ?? 0;
  const isComplete = data.status === "live" && percentage === 100;
  const isPartial = data.status === "live" && percentage >= 50 && percentage < 100;
  const isPlanned = !isComplete && !isPartial;
  const isShared = data.sharedProducts.length > 1;

  const stateClasses = isComplete
    ? "border-teal-600 bg-teal-600 text-white"
    : isPartial
      ? "border-amber-300 bg-white text-amber-950"
      : "border-dashed border-amber-500 bg-amber-50 text-amber-950";

  return (
    <div className={`relative w-[210px] overflow-hidden rounded-2xl border-2 shadow-md transition ${stateClasses} ${isShared ? "ring-4 ring-violet-300" : ""}`}>
      <Handle
        type="target"
        position={data.side === "left" ? Position.Right : Position.Left}
        className={`!h-2 !w-2 ${isShared ? "!border-violet-200 !bg-violet-600" : "!border-slate-200 !bg-slate-500"}`}
      />
      {isPartial ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-amber-200/80"
          style={{ width: `${percentage}%` }}
        />
      ) : null}
      <button
        type="button"
        className="nodrag nopan relative z-10 block min-h-[74px] w-full cursor-pointer px-3 py-2.5 text-left"
        aria-label={`${data.name} modül detaylarını aç`}
        onClick={() => data.onOpenModule(data)}
      >
        <strong className="block truncate text-[13px] font-bold" title={data.name}>{data.name}</strong>
        <span className={`mt-1 flex items-center gap-1.5 text-[11px] font-semibold ${isComplete ? "text-teal-100" : "text-amber-800"}`}>
          {isPlanned ? <span className="rounded-full bg-amber-200 px-2 py-0.5 text-amber-950">yakında</span> : <span>{percentage}%</span>}
          {isShared ? <span className={`ml-auto ${isComplete ? "text-violet-100" : "text-violet-700"}`} title="Paylaşılan modül">◆ paylaşılan</span> : null}
        </span>
      </button>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  hub: HubNode,
  product: ProductNode,
  module: ModuleNode,
};

function moduleNodeId(module: ModuleSummary) {
  return `module:${module.productCode}:${module.code}`;
}

function layoutBranch(
  products: ProductSummary[],
  modules: ModuleSummary[],
  expandedProductCode: string | null,
  direction: "LR" | "RL",
  side: "left" | "right",
  onToggle: (productCode: string) => void,
  onOpenModule: (module: ModuleSummary) => void,
) {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: direction, ranksep: 145, nodesep: 24, marginx: 0, marginy: 0 });
  graph.setNode(HUB_ID, { width: HUB_WIDTH, height: HUB_HEIGHT });

  products.forEach((product) => {
    graph.setNode(product.code, { width: PRODUCT_WIDTH, height: PRODUCT_HEIGHT });
    graph.setEdge(HUB_ID, product.code);
  });

  const visibleModules = expandedProductCode
    ? modules.filter((module) => module.productCode === expandedProductCode && products.some((product) => product.code === expandedProductCode))
    : [];

  visibleModules.forEach((module) => {
    const id = moduleNodeId(module);
    graph.setNode(id, { width: MODULE_WIDTH, height: MODULE_HEIGHT });
    graph.setEdge(module.productCode, id);
  });

  dagre.layout(graph);
  const hub = graph.node(HUB_ID);
  const hubLeft = hub.x - HUB_WIDTH / 2;
  const hubTop = hub.y - HUB_HEIGHT / 2;

  const productNodes = products.map<Node<ProductNodeData>>((product) => {
    const positioned = graph.node(product.code);
    return {
      id: product.code,
      type: "product",
      position: {
        x: positioned.x - PRODUCT_WIDTH / 2 - hubLeft,
        y: positioned.y - PRODUCT_HEIGHT / 2 - hubTop,
      },
      data: {
        ...product,
        side,
        expanded: product.code === expandedProductCode,
        onToggle,
      },
    };
  });

  const moduleNodes = visibleModules.map<Node<ModuleNodeData>>((module) => {
    const positioned = graph.node(moduleNodeId(module));
    return {
      id: moduleNodeId(module),
      type: "module",
      position: {
        x: positioned.x - MODULE_WIDTH / 2 - hubLeft,
        y: positioned.y - MODULE_HEIGHT / 2 - hubTop,
      },
      data: { ...module, side, onOpenModule },
    };
  });

  return { productNodes, moduleNodes, visibleModules };
}

function createMap(
  products: ProductSummary[],
  modules: ModuleSummary[],
  expandedProductCode: string | null,
  onToggle: (productCode: string) => void,
  onOpenModule: (module: ModuleSummary) => void,
) {
  const leftProducts = products.filter((_, index) => index % 2 === 0);
  const rightProducts = products.filter((_, index) => index % 2 === 1);
  const left = layoutBranch(leftProducts, modules, expandedProductCode, "RL", "left", onToggle, onOpenModule);
  const right = layoutBranch(rightProducts, modules, expandedProductCode, "LR", "right", onToggle, onOpenModule);

  const nodes: Node[] = [
    { id: HUB_ID, type: "hub", position: { x: 0, y: 0 }, data: {} },
    ...left.productNodes,
    ...right.productNodes,
    ...left.moduleNodes,
    ...right.moduleNodes,
  ];

  const productEdges: Edge[] = products.map((product, index) => ({
    id: `hub-${product.code}`,
    source: HUB_ID,
    sourceHandle: index % 2 === 0 ? "left" : "right",
    target: product.code,
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 1.15 },
  }));

  const moduleEdges: Edge[] = [...left.visibleModules, ...right.visibleModules].map((module) => ({
    id: `product-${module.productCode}-${module.code}`,
    source: module.productCode,
    sourceHandle: "modules",
    target: moduleNodeId(module),
    type: "smoothstep",
    style: {
      stroke: module.sharedProducts.length > 1 ? "#8b5cf6" : "#d6a02d",
      strokeWidth: module.sharedProducts.length > 1 ? 1.8 : 1.2,
    },
  }));

  return { nodes, edges: [...productEdges, ...moduleEdges] };
}

function ModuleDetailPanel({ module, onClose }: { module: ModuleSummary; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isPlanned = module.draft || module.status === "planned";
  const percentage = Math.max(0, Math.min(100, module.completePercentage ?? 0));
  const otherProducts = module.sharedProducts.filter((product) => product !== module.productCode);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="module-drawer-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="module-drawer" role="dialog" aria-modal="true" aria-labelledby="module-drawer-title">
        <header className="module-drawer-header">
          <div>
            <span className="module-drawer-kicker">{isPlanned ? "Planlanan modül" : "Modül detayı"}</span>
            <h2 id="module-drawer-title">{module.name}</h2>
          </div>
          <button ref={closeButtonRef} type="button" aria-label="Detay panelini kapat" onClick={onClose}>×</button>
        </header>

        <div className="module-drawer-body">
          {otherProducts.length > 0 ? (
            <div className="module-shared-note">
              <strong>◆ Paylaşılan modül</strong>
              <p>Bu modül şu ürünlerde de var: {otherProducts.join(", ")}.</p>
            </div>
          ) : null}

          <section className="module-detail-section">
            <h3>Kısa açıklama</h3>
            <p>{module.shortDescription ?? "Kısa açıklama henüz eklenmemiş."}</p>
          </section>

          <section className="module-detail-section">
            <h3>Açıklama</h3>
            <p>{module.description ?? "Açıklama henüz eklenmemiş."}</p>
          </section>

          <section className="module-detail-section">
            <h3>Tamamlanma durumu</h3>
            {isPlanned ? (
              <span className="development-badge">Geliştirme aşamasında</span>
            ) : (
              <div className="module-progress-block">
                <div className="module-progress-label"><span>İlerleme</span><strong>{percentage}%</strong></div>
                <div className="module-progress-track" role="progressbar" aria-label="Modül tamamlanma yüzdesi" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
                  <span style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )}
          </section>

          {!isPlanned ? (
            <section className="module-detail-section">
              <h3>Özellikler</h3>
              {module.features.length > 0 ? (
                <ul className="module-feature-list">
                  {module.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              ) : (
                <p>Bu modül için özellik listesi bulunmuyor.</p>
              )}
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export function ProductModuleMap({ products, modules }: { products: ProductSummary[]; modules: ModuleSummary[] }) {
  const [expandedProductCode, setExpandedProductCode] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleSummary | null>(null);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null);

  const handleToggle = useCallback((productCode: string) => {
    setExpandedProductCode((current) => current === productCode ? null : productCode);
    setSelectedModule(null);
  }, []);

  const handleOpenModule = useCallback((module: ModuleSummary) => {
    setSelectedModule(module);
  }, []);

  const { nodes, edges } = useMemo(
    () => createMap(products, modules, expandedProductCode, handleToggle, handleOpenModule),
    [products, modules, expandedProductCode, handleToggle, handleOpenModule],
  );

  useEffect(() => {
    if (!flowInstance) return;
    const animationFrame = requestAnimationFrame(() => {
      flowInstance.fitView({ padding: 0.16, minZoom: 0.2, maxZoom: 1, duration: 420 });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [expandedProductCode, flowInstance, nodes.length]);

  return (
    <>
      <section className="map-frame" aria-label="OnSuite ürün ve modül haritası">
        <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setFlowInstance}
        fitView
        fitViewOptions={{ padding: 0.18, minZoom: 0.25, maxZoom: 1 }}
        minZoom={0.16}
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
      {selectedModule ? <ModuleDetailPanel module={selectedModule} onClose={() => setSelectedModule(null)} /> : null}
    </>
  );
}
