import { create } from "zustand"
import * as R from 'remeda';
import { StubDag } from "@/apps/common/stubs"
import { DagSpec } from "@/apps/common/dag-dsl"
import { Node, Edge, NodeChange, EdgeChange, Connection, MarkerType } from "@xyflow/react"
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

export type GraphAreaState = {
    dag: DagSpec;
    nodes: Node[];
    edges: Edge[];
    // Add a method to transform DAG to React Flow nodes
    transformDagToNodes: () => Node[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    deleteNodeModule: (id: string) => void;
}

const dag = StubDag();

// the following two variables are used to control the visibility and position of the toolbar
// should only be applied to the dagModule node type
const forceToolbarVisible = false; // Set this to true or false based on your requirement
const toolbarPosition = 'right'; // Set this to 'top' or 'bottom' based on your requirement

// Helper function to transform DAG to nodes
const dagToNodes = (dag: DagSpec): Node[] => {
    const nodes: Node[] = [];

    // Add module nodes
    Object.entries(dag.modules).forEach(([uuid, module], index) => {
        nodes.push({
            id: uuid,
            type: 'dagModule', // Make sure this matches exactly with the nodeTypes in the view
            data: { label: module.name, id: uuid, forceToolbarVisible, toolbarPosition }, // Include id in data for easier access
            position: { x: 250, y: index * 100 + 50 },
        });
    });

    // Add data nodes
    Object.entries(dag.data).forEach(([uuid, data], index) => {
        nodes.push({
            id: uuid,
            type: 'dagData', // Make sure this matches exactly with the nodeTypes in the view
            data: { label: data.name, id: uuid }, // Include id in data for easier access
            position: { x: 50, y: index * 100 + 50 },
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
            target,
            animated: true,
            style: { stroke: '#f6ab00' },
            type: 'smoothstep',
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#f6ab00',
            },
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
        },
        onNodesChange: (changes: NodeChange[]) => {
            set({
                nodes: applyNodeChanges(changes, get().nodes),
            });
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            set({
                edges: applyEdgeChanges(changes, get().edges),
            });
        },
        onConnect: (connection: Connection) => {
            set({
                edges: addEdge(connection, get().edges),
            });
        },
        setNodes: (nodes: Node[]) => {
            set({ nodes });
        },
        setEdges: (edges: Edge[]) => {
            set({ edges });
        },
        deleteNodeModule(id) {
            const dag = get().dag;
            const modules = R.filter(Object.entries(dag.modules), ([moduleId, _]) => moduleId !== id);
            set({ dag: { ...dag, modules: R.fromEntries(modules) } });
        },
    })
);