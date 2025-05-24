import { create } from "zustand"
import * as R from "remeda"
import { DagSpec, DataNodeSpec, emptyDag, EngineContext, ModuleNodeSpec } from "@/apps/common/dag-dsl"
import { Edge, NodeChange, EdgeChange, Connection, MarkerType, NodeRemoveChange, getIncomers, getOutgoers, Position } from "@xyflow/react"
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react"
import EditorBackendApi from "../../editor-backend-api"
import { useEffect } from "react"
import { v4 } from "uuid"
import { Graph, GraphAreaStateApi, GraphRender, LayoutDirection, RenderAction, RenderedNode } from "./graph-area-dsl"
import Dagre from "@dagrejs/dagre"

export function renderDag(dag: DagSpec, state: Graph & { preferredLayout: LayoutDirection } ): GraphRender {

    const dagToNodes = () => {
        const newNodes: RenderedNode[] = []

        // Add module nodes
        Object.entries(dag.modules).forEach(([uuid, module], index) => {
            if (state.nodes.find((n) => n.id === uuid)) return
            newNodes.push({
                id: uuid,
                type: "module", // Make sure this matches exactly with the nodeTypes in the view
                data: { tag: "module", ...module, preferredLayout: state.preferredLayout }, // Include id in data for easier access
                position: { x: 250, y: index * 100 + 50 },
            })
        })

        // Add data nodes
        Object.entries(dag.data).forEach(([uuid, data], index) => {
            if (state.nodes.find((n) => n.id === uuid)) return
            newNodes.push({
                id: uuid,
                type: "data", // Make sure this matches exactly with the nodeTypes in the view
                data: { tag: "data", ...data, preferredLayout: state.preferredLayout }, // Include id in data for easier access
                position: { x: 50, y: index * 100 + 50 },
            })
        })

        const ketpNodes = state.nodes.filter((node) => {
            if (node.type === "module") 
                return dag.modules[node.id] !== undefined
            else if (node.type === "data")
                return dag.data[node.id] !== undefined
            else
                return true
        })

        return [...ketpNodes, ...newNodes]
    }

    const dagToEdges = (): Edge[] => {
        const dagEdges = [...dag.inEdges, ...dag.outEdges]
        return dagEdges.map(([source, target]) =>
            ({
                id: `${source}-${target}`,
                source,
                target,
                animated: true,
                style: { stroke: "#f6ab00" },
                type: "smoothstep",
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: "#f6ab00",
                },
            })
        )
    }

    return { dag, nodes: dagToNodes(), edges: dagToEdges(), lastAction: "graph-render" }
}

export function layoutNodes(nodes: RenderedNode[], edges: Edge[], options: { direction:  LayoutDirection }): Graph {
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

            return { 
                ...node, 
                data: { ...node.data, preferredLayout: options.direction }, 
                position: { x, y },
                sourcePosition: options.direction === "TB" ? Position.Bottom : Position.Right,
                targetPosition: options.direction === "TB" ? Position.Top : Position.Left,
            };
        }),
        edges,
    };
}; 


export type GraphAreaState = {
    dag: DagSpec
    nodes: RenderedNode[]
    edges: Edge[]
    preferredLayout: LayoutDirection 
    lastAction?: RenderAction

    loadDag: (name: string) => Promise<void>

    onNodesChange: (changes: NodeChange<RenderedNode>[]) => Promise<void>
    onEdgesChange: (changes: EdgeChange[]) => void

    onLayoutPress: (layout: LayoutDirection) => void
    addModuleToDag: (module: ModuleNodeSpec) => Promise<void>
    deleteNodeModule: (id: string) => void
    canBeDeleted: ({ nodes, edges }: Graph) => Promise<boolean | Graph>
    getDagInputs: () => { [uuid: string]: DataNodeSpec }
    renderEngineContext: (context: EngineContext) => void
}

export const useGraphAreaStore = create<GraphAreaState>()(
    (set, get) => ({
        dag: emptyDag(),
        nodes: [],
        edges: [],
        preferredLayout: "TB",

        loadDag: async (name: string) => {
            const dag = await EditorBackendApi.getDag(name)
            const graph = renderDag(dag, get())
            set(graph)
        },

        onNodesChange: async (changes: NodeChange<RenderedNode>[]) => {
            const state = get()
            const api = new GraphAreaStateApi(state)

            if (state.lastAction === "graph-render")
                return set(api.layoutGraphAfterRender(changes))

            set(await api.applyNodeChanges(changes))
        },

        onEdgesChange: (changes: EdgeChange[]) => {
            set({
                edges: applyEdgeChanges(changes, get().edges),
            })
        },

        onLayoutPress: (layout:  LayoutDirection) => {
            const graph = layoutNodes(get().nodes, get().edges, { direction: layout })
            set({ ...graph, preferredLayout: layout })
        },

        addModuleToDag: async (module: ModuleNodeSpec) => {
            const dag = get().dag
            const uuid = v4()
            const newDataIn = Object.keys(module.consumes).reduce((acc, name) => 
                ({ ...acc, [v4()]: { name, nicknames: { [uuid]: name }, cType: module.consumes[name] } })
            , {} as { [uuid: string]: DataNodeSpec })
            const newDataOut = Object.keys(module.produces).reduce((acc, name) =>
                ({ ...acc, [v4()]: { name, nicknames: { [uuid]: name }, cType: module.produces[name] } })
            , {} as { [uuid: string]: DataNodeSpec })
            const newEdgesIn = Object.keys(newDataIn).reduce((acc, id) => acc.concat([[id, uuid]]), [] as [string, string][])
            const newEdgesOut = Object.keys(newDataOut).reduce((acc, id) => acc.concat([[uuid, id]]), [] as [string, string][])
            const newDag = {
                ...dag,
                modules: { ...dag.modules, [uuid]: module },
                data: { ...dag.data, ...newDataIn, ...newDataOut },
                inEdges: dag.inEdges.concat(newEdgesIn),
                outEdges: dag.outEdges.concat(newEdgesOut),
            }
            const graph = renderDag(newDag, get())
            await EditorBackendApi.saveDag(newDag)
            set(graph)
        },
        deleteNodeModule(id) {
            const dag = get().dag
            const modules = R.filter(Object.entries(dag.modules), ([moduleId, _]) => moduleId !== id)
            set({ dag: { ...dag, modules: R.fromEntries(modules) } })
        },
        canBeDeleted: async ({ nodes, edges }: Graph) => {
            // Implement your logic to check if the nodes and edges can be deleted
            const modules = nodes.filter(node => node.type === "module")

            if (modules.length < 1) {
                return false
            }

            const dag = get().dag

            const moduleIds = modules.map((module) => module.id) as string[]
            const moduleInputs = edges.filter(edge => edge.target === modules[0].id)
            const moduleInputsSources = moduleInputs.map(edge => edge.source)
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
                    return target === source
                })

                if (isProduceByOtherModule) {
                    return false
                } else {
                    const sourceHasOtherConsumers = dag.inEdges.some(([s, t]) => {
                        return s === source && !R.isIncludedIn(t, moduleIds)
                    })

                    return !sourceHasOtherConsumers
                }
            })

            const moduleOutputs = edges.filter(edge => edge.source === modules[0].id)
            const moduleOutputsTargets = moduleOutputs.map(edge => edge.target)
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
                    return source === target
                })

                if (isConsumeByOtherModule) {
                    return false
                } else {
                    const targetHasOtherProducers = dag.outEdges.some(([s, t]) => {
                        return t === target && !R.isIncludedIn(s, moduleIds)
                    })

                    return !targetHasOtherProducers
                }
            })

            // we remove any edge that includes the moduleId of the module we are deleting
            const newDagInEdges = dag.inEdges.filter(([source, target]) => {
                return !R.isIncludedIn(source, moduleIds) && !R.isIncludedIn(target, moduleIds)
            })
            const newDagOutEdges = dag.outEdges.filter(([source, target]) => {
                return !R.isIncludedIn(source, moduleIds) && !R.isIncludedIn(target, moduleIds)
            })

            const newModules = R.omit(dag.modules, moduleIds)
            const newDatas = R.omit(dag.data, R.concat(inputDatasToRemove, outputDatasToRemove))

            const newDag = R.merge(dag, { modules: newModules, data: newDatas, inEdges: newDagInEdges, outEdges: newDagOutEdges })

            const graph = renderDag(newDag, get())
            await EditorBackendApi.saveDag(newDag)
            set(graph)

            return { nodes: [...modules], edges: [] }
        },
        getDagInputs: () => {
            const dag = get().dag
            // const dag = StubDag()

            const dataInputNames = R.pipe(dag.inEdges,
                R.map(([source, _]) => source),
                R.unique(),
                R.filter((source) => !dag.outEdges.some(([_, target]) => target === source))
            )

            const filteredInputs = R.filter(Object.entries(dag.data), ([uuid, _]) => dataInputNames.includes(uuid))

            return R.fromEntries(filteredInputs)
        },
        renderEngineContext: (context: EngineContext) => {
            const newNodes: RenderedNode[] = get().nodes.map((node) => {
                if (node.type == "data" && node.data.tag == "data") {
                    return { ...node, data: { ...node.data, value: context.loadedData[node.id] } }
                } else if (node.type == "module" && node.data.tag == "module") {
                    return {...node, data: { ...node.data, status: context.moduleStatus[node.id] }}
                } else 
                    throw new Error("Unknown node type")
            })
            set({ nodes: newNodes, lastAction: "graph-render" })
        },
    })
)

export const useInitGraphAreaState = (dagName: string) => {
    useEffect(() => {
        const s = useGraphAreaStore.getState()
        s.loadDag(dagName)
    }, [])
}