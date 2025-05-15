import { create } from "zustand"
import * as R from 'remeda';
import { DagSpec, DataNodeSpec, emptyDag, EngineContext, ModuleNodeSpec } from "@/apps/common/dag-dsl"
import { Node, Edge, NodeChange, EdgeChange, Connection, MarkerType, NodeRemoveChange, EdgeAddChange, getIncomers, getOutgoers } from "@xyflow/react"
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import EditorBackendApi from "../../editor-backend-api";
import { useEffect } from "react";
import { v4 } from "uuid";
import { StubDag } from "@/apps/common/stubs";

export type GraphAreaState = {
    dag: DagSpec;
    nodes: Node[];
    edges: Edge[];
    // Add a method to transform DAG to React Flow nodes
    loadDag: (name: string) => Promise<void>;
    transformDagToNodes: () => Node[];
    onNodesChange: (changes: NodeChange[]) => Promise<void>;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addModuleToDag: (module: ModuleNodeSpec) => Promise<void>;
    deleteNodeModule: (id: string) => void;
    mergeDataNodes: (nodes: Node[]) => Promise<void>;
    canBeDeleted: ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => Promise<boolean | { nodes: Node[], edges: Edge[] }>;
    getDagInputs: () => { [uuid: string]: DataNodeSpec };
    renderEngineContext: (context: EngineContext) => void;
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

type SCNode = { type: "state-change-node", change: NodeChange }
type SCEdge = { type: "state-change-edge", change: EdgeChange }
type SCDag = { type: "state-change-dag", change: DagSpec }
type StateChange = SCNode | SCEdge | SCDag

function scNode(change: NodeChange): StateChange {
    return ({ type: "state-change-node", change })
}
function scEdge(change: EdgeChange): StateChange {
    return ({ type: "state-change-edge", change })
}
function scDag(change: DagSpec): StateChange {
    return ({ type: "state-change-dag", change })
}

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
        onNodesChange: async (changes: NodeChange[]) => {
            const state = get();
            const newChanges: StateChange[] = changes.flatMap((change) => {
                if (change.type === 'position' && !change.dragging) {
                    const node = state.nodes.filter((node) => node.id === change.id)[0]
                    if (node.type !== 'dagData') return [scNode(change)];
                    const intersectingNode = state.nodes.filter((n) => {
                        if (n.id === node.id) return false;
                        const dx = Math.abs(node.position.x - n.position.x);
                        const dy = Math.abs(node.position.y - n.position.y);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < 50
                    })[0];
                    if (intersectingNode && intersectingNode.type === 'dagData') {
                        console.log("intersecting node", intersectingNode)
                        const dagLandingNode = state.dag.data[intersectingNode.id];
                        const dagDraggingNode = state.dag.data[node.id];
                        if (dagLandingNode.name != dagDraggingNode.name) return [scNode(change)]
                        const removeChange: NodeRemoveChange = {
                            id: node.id,
                            type: 'remove'
                        }
                        const inc = getIncomers(node, state.nodes, state.edges)
                        const incomers: EdgeChange[] = inc.map((n) => {
                            return {
                                type: "add",
                                item: {
                                    id: v4(),
                                    source: n.id,
                                    target: intersectingNode.id,
                                    animated: true,
                                    style: { stroke: '#f6ab00' },
                                    type: 'smoothstep',
                                    markerEnd: {
                                        type: MarkerType.ArrowClosed,
                                        color: '#f6ab00',
                                    },
                                }
                            }
                        })
                        const out = getOutgoers(node, state.nodes, state.edges)
                        const outgoers: EdgeChange[] = out.map((n) => {
                            return {
                                type: "add",
                                item: {
                                    id: v4(),
                                    source: intersectingNode.id,
                                    target: n.id,
                                    animated: true,
                                    style: { stroke: '#f6ab00' },
                                    type: 'smoothstep',
                                    markerEnd: {
                                        type: MarkerType.ArrowClosed,
                                        color: '#f6ab00',
                                    },
                                }
                            }
                        })
                        const addEdges: StateChange[] = incomers.concat(outgoers).map(x => scEdge(x))
                        const removedDagInEdges: [string, string][] = state.dag.inEdges.filter(([source, target]) => target !== node.id);
                        const removedDagOutEdges: [string, string][] = state.dag.outEdges.filter(([source, target]) => source !== node.id);
                        const addedDagInEdges: [string, string][] = inc.map(x => [x.id, intersectingNode.id])
                        const addedDagOutEdges: [string, string][] = out.map(x => [intersectingNode.id, x.id])
                        const newDag: DagSpec = {
                            ...state.dag,
                            data: R.omit(state.dag.data, [node.id]),
                            inEdges: [...removedDagInEdges, ...addedDagInEdges],
                            outEdges: [...removedDagOutEdges, ...addedDagOutEdges],
                        }
                        return [scNode(removeChange), ...addEdges, scDag(newDag)]
                    } else
                        return [scNode(change)];
                } else
                    return [scNode(change)];
            });

            const nodeChanges: NodeChange[] = newChanges.filter(x => x.type == "state-change-node").map(x => x.change)
            const edgeChanges: EdgeChange[] = newChanges.filter(x => x.type == "state-change-edge").map(x => x.change)
            const dagChanges = newChanges.filter(x => x.type == "state-change-dag").map(x => x.change)[0]
            const dag = dagChanges ? dagChanges : state.dag
            set({
                dag,
                nodes: applyNodeChanges(nodeChanges, state.nodes),
                edges: applyEdgeChanges(edgeChanges, state.edges)
            });
            dagChanges && await EditorBackendApi.saveDag(dag.name, dag);
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
        addModuleToDag: async (module: ModuleNodeSpec) => {
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
            await EditorBackendApi.saveDag(newDag.name, newDag);
            set({ dag: newDag, nodes, edges });
        },
        deleteNodeModule(id) {
            const dag = get().dag;
            const modules = R.filter(Object.entries(dag.modules), ([moduleId, _]) => moduleId !== id);
            set({ dag: { ...dag, modules: R.fromEntries(modules) } });
        },
        mergeDataNodes: async (nodes: Node[]) => {
            console.log(nodes)
        },
        canBeDeleted: async ({ nodes, edges }: { nodes: Node[], edges: Edge[] }) => {
            // Implement your logic to check if the nodes and edges can be deleted
            const modules = nodes.filter(node => node.type === 'dagModule');

            if (modules.length < 1) {
                return false;
            }

            const dag = get().dag;

            const moduleIds = modules.map((module) => module.data.id) as string[];
            const moduleInputs = edges.filter(edge => edge.target === modules[0].id);
            const moduleInputsSources = moduleInputs.map(edge => edge.source);
            /**
             * Filters module input sources to find inputs that are no longer used by any other modules.
             * 
             * @remarks
             * This code identifies input data sources that are exclusively consumed by the modules being removed,
             * by checking if the source has any remaining connections to modules outside the removal set.
             * 
             * @returns An array of input data sources that can be safely removed because they have no other consumers
             * in the directed acyclic graph (DAG) besides the modules being removed.
             */
            const inputDatasToRemove = moduleInputsSources.filter((source) => {
                const isProduceByOtherModule = dag.outEdges.some(([_, target]) => {
                    return target === source;
                });

                if (isProduceByOtherModule) {
                    return false;
                } else {
                    const sourceHasOtherConsumers = dag.inEdges.some(([s, t]) => {
                        return s === source && !R.isIncludedIn(t, moduleIds);
                    });

                    return !sourceHasOtherConsumers;
                }
            });

            const moduleOutputs = edges.filter(edge => edge.source === modules[0].id);
            const moduleOutputsTargets = moduleOutputs.map(edge => edge.target);
            /**
             * Filters module output targets to find outputs that are no longer used by any other modules.
             * 
             * @remarks
             * This code identifies output data targets that are exclusively produced by the modules being removed,
             * by checking if the target has any remaining connections to modules outside the removal set.
             * 
             * @returns An array of output data targets that can be safely removed because they have no other consumers
             * in the directed acyclic graph (DAG) besides the modules being removed.
             */
            const outputDatasToRemove = moduleOutputsTargets.filter((target) => {
                const isConsumeByOtherModule = dag.inEdges.some(([source, _]) => {
                    return source === target;
                });

                if (isConsumeByOtherModule) {
                    return false;
                } else {
                    const targetHasOtherProducers = dag.outEdges.some(([s, t]) => {
                        return t === target && !R.isIncludedIn(s, moduleIds);
                    });

                    return !targetHasOtherProducers;
                }
            });

            // we remove any edge that includes the moduleId of the module we are deleting
            const newDagInEdges = dag.inEdges.filter(([source, target]) => {
                return !R.isIncludedIn(source, moduleIds) && !R.isIncludedIn(target, moduleIds);
            });
            const newDagOutEdges = dag.outEdges.filter(([source, target]) => {
                return !R.isIncludedIn(source, moduleIds) && !R.isIncludedIn(target, moduleIds);
            });

            const newModules = R.omit(dag.modules, moduleIds);
            const newDatas = R.omit(dag.data, R.concat(inputDatasToRemove, outputDatasToRemove));

            const newDag = R.merge(dag, { modules: newModules, data: newDatas, inEdges: newDagInEdges, outEdges: newDagOutEdges });

            const newNodes = dagToNodes(newDag)
            const newEdges = dagToEdges(newDag)
            await EditorBackendApi.saveDag(newDag.name, newDag);
            set({ dag: newDag, nodes: newNodes, edges: newEdges });



            return { nodes: [...modules], edges: [] };
        },
        getDagInputs: () => {
            const dag = get().dag;
            // const dag = StubDag();

            const dataInputNames = R.pipe(dag.inEdges,
                R.map(([source, _]) => source),
                R.unique(),
                R.filter((source) => !dag.outEdges.some(([_, target]) => target === source))
            )

            const filteredInputs = R.filter(Object.entries(dag.data), ([uuid, _]) => dataInputNames.includes(uuid));

            return R.fromEntries(filteredInputs);
        },
        renderEngineContext: (context: EngineContext) => {
            console.log("renderEngineContext", context)
            // Implement your logic to render the engine context
        },
    })
);

export const useInitGraphAreaState = (dagName: string) => {
    useEffect(() => {
        const s = useGraphAreaStore.getState();
        s.loadDag(dagName);
    }, []);
}