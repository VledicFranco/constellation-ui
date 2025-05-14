import { create } from "zustand"
import * as R from 'remeda';
import { DagSpec, DataNodeSpec, emptyDag, ModuleNodeSpec } from "@/apps/common/dag-dsl"
import { Node, Edge, NodeChange, EdgeChange, Connection, MarkerType } from "@xyflow/react"
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import EditorBackendApi from "../../editor-backend-api";
import { useEffect } from "react";
import { v4 } from "uuid";

export type GraphAreaState = {
    dag: DagSpec;
    nodes: Node[];
    edges: Edge[];
    // Add a method to transform DAG to React Flow nodes
    loadDag: (name: string) => Promise<void>;
    transformDagToNodes: () => Node[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addModuleToDag: (module: ModuleNodeSpec) => void;
    deleteNodeModule: (id: string) => void;
    canBeDeleted: ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => Promise<boolean | { nodes: Node[], edges: Edge[] }>;
}

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
    const dagEdges = [...dag.inEdges, ...dag.outEdges];
    dagEdges.forEach(([source, target]) => {
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
        dag: emptyDag,
        nodes: [],
        edges: [],
        loadDag: async (name: string) => {
            const dag = await EditorBackendApi.getDag(name)
            const nodes = dagToNodes(dag);
            const edges = dagToEdges(dag);
            set({ dag, nodes, edges });
        },
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
        addModuleToDag: (module: ModuleNodeSpec) => {
            const dag = get().dag;
            const uuid = v4();
            console.log(module)
            const newDataIn = module.produces.reduce((acc, node) => ({ ...acc, [v4()]: node }), {} as { [uuid: string]: DataNodeSpec });
            const newDataOut = module.consumes.reduce((acc, node) => ({ ...acc, [v4()]: node }), {} as { [uuid: string]: DataNodeSpec });
            const newEdgesIn = Object.keys(newDataIn).reduce((acc, id) => acc.concat([[id, uuid]]), [] as [string, string][]);
            const newEdgesOut = Object.keys(newDataOut).reduce((acc, id) => acc.concat([[uuid, id]]), [] as [string, string][]);
            const newDag = { 
                ...dag, 
                modules: { ...dag.modules, [uuid]: module },
                data: { ...dag.data, ...newDataIn, ...newDataOut },
                inEdges: dag.inEdges.concat(newEdgesIn),
                outEdges: dag.outEdges.concat(newEdgesOut),
            }
            const nodes = dagToNodes(newDag);
            const edges = dagToEdges(newDag);
            set({ dag: newDag, nodes, edges });
        },
        deleteNodeModule(id) {
            const dag = get().dag;
            const modules = R.filter(Object.entries(dag.modules), ([moduleId, _]) => moduleId !== id);
            set({ dag: { ...dag, modules: R.fromEntries(modules) } });
        },
        canBeDeleted: async ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
            // Implement your logic to check if the nodes and edges can be deleted
            const modules = nodes.filter(node => node.type === 'dagModule');

            if (modules.length < 1) {
                return false;
            }


            return true;
        },
    })
);

export const useInitGraphAreaState = (dagName: string) => {
    useEffect(() => {
        const s = useGraphAreaStore.getState();
        s.loadDag(dagName);
    }, []);
}