import { create } from "zustand"
import { StubDag } from "@/apps/common/stubs"
import { DagSpec } from "@/apps/common/dag-dsl"
import { Node, Edge } from "@xyflow/react"

export type GraphAreaState = {
    dag: DagSpec;
    nodes: Node[];
    edges: Edge[];
    // Add a method to transform DAG to React Flow nodes
    transformDagToNodes: () => Node[];
}

const dag = StubDag();

// Helper function to transform DAG to nodes
const dagToNodes = (dag: DagSpec): Node[] => {
    const nodes: Node[] = [];

    // Add module nodes
    Object.entries(dag.modules).forEach(([uuid, module], index) => {
        nodes.push({
            id: uuid,
            type: 'default',
            data: { label: module.name },
            position: { x: 250, y: index * 100 + 50 }, // Simple positioning
        });
    });

    // Add data nodes
    Object.entries(dag.data).forEach(([uuid, data], index) => {
        nodes.push({
            id: uuid,
            type: 'input',
            data: { label: data.name },
            position: { x: 50, y: index * 100 + 50 }, // Simple positioning
        });
    });

    return nodes;
};

const dagToEdges = (dag: DagSpec): Edge[] => {
    const edges: Edge[] = [];
    dag.edges.forEach(([source, target]) => {
        edges.push({
            id: `${source}-${target}`,
            source,
            target
        });
    });
    return edges;
};

export const useGraphAreaStore = create<GraphAreaState>()(
    (set, get) => ({
        dag,
        nodes: dagToNodes(dag),
        edges: dagToEdges(dag),
        transformDagToNodes: () => {
            const nodes = dagToNodes(get().dag);
            set({ nodes });
            return nodes;
        }
    })
);