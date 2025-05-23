import Dagre from "@dagrejs/dagre";
import { Panel, ControlButton, Edge } from "@xyflow/react";
import { MoveHorizontal, MoveVertical } from "lucide-react";
import { useCallback, CSSProperties } from "react";
import { RenderedNode } from "../graph-area-dsl";

function getLayoutedElements(nodes: RenderedNode[], edges: Edge[], options: { direction: string }): { nodes: RenderedNode[], edges: Edge[] } {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        }),
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

interface LayoutPanelProps {
    nodes: RenderedNode[],
    edges: Edge[],
    setNodes: (nodes: RenderedNode[]) => void,
    setEdges: (edges: Edge[]) => void,
}

export default function LayoutPanel({ nodes, edges, setNodes, setEdges }: LayoutPanelProps) {

    const onLayout = useCallback(
        (direction: string) => {
            const layouted = getLayoutedElements(nodes, edges, { direction });
            setNodes([...layouted.nodes]);
            setEdges([...layouted.edges]);
        },
        [nodes, edges],
    );

    return (
        <Panel id="explorer-toggle-button"
            className={"vertical rounded-sm w-60"}
            position={"top-left"}
            aria-label="Module Explorer toggle button">
            <ControlButton
                title="vertical layout"
                aria-label="vertical layout"
                onClick={() => onLayout("LR")}
                style={{ width: "40px", height: "40px" } as CSSProperties}>
                <MoveHorizontal style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
            </ControlButton>
            <ControlButton
                title="vertical layout"
                aria-label="vertical layout"
                onClick={() => onLayout("TB")}
                style={{ width: "40px", height: "40px" } as CSSProperties}>
                <MoveVertical style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
            </ControlButton>
        </Panel>
    )
}
