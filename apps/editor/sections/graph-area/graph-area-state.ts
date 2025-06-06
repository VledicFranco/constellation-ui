import { CValue, DagSpec, emptyDag, ModuleNodeSpec, RuntimeState } from "@/apps/common/dag-dsl"
import { applyEdgeChanges, Edge, EdgeChange, NodeChange } from "@xyflow/react"
import { useEffect } from "react"
import * as R from "remeda"
import { create } from "zustand"
import EditorBackendApi from "../../editor-backend-api"
import { Graph, GraphAreaStateApi, LayoutDirection, RenderAction, RenderedNode } from "./graph-area-dsl"


export type GraphAreaState = {
    dag: DagSpec
    nodes: RenderedNode[]
    edges: Edge[]
    context?: RuntimeState
    selectedNodeId?: string
    displayedTool?: string
    preferredLayout: LayoutDirection 
    lastAction?: RenderAction

    loadDag: (name: string) => Promise<void>
    hideTools: () => void

    onNodesChange: (changes: NodeChange<RenderedNode>[]) => Promise<void>
    onEdgesChange: (changes: EdgeChange[]) => void

    selectTool: (toolName: string) => void
    selectNode: (id: string) => void
    onLayoutPress: (layout: LayoutDirection) => void
    addModuleToDag: (module: ModuleNodeSpec) => Promise<void>
    deleteNodeModule: (id: string) => void
    canBeDeleted: ({ nodes, edges }: Graph) => Promise<boolean | Graph>
    runDagWithInputs: (inputs: Record<string, CValue>) => Promise<RuntimeState>
    cleanEngineContext: () => void
}

export const useGraphAreaStore = create<GraphAreaState>()(
    (set, get) => ({
        dag: emptyDag(),
        nodes: [],
        edges: [],
        preferredLayout: "TB",

        loadDag: async (name: string) => {
            const dag = await EditorBackendApi.getDag(name)
            const api = new GraphAreaStateApi({ ...get(), dag })
            set(api.renderDag())
        },

        selectTool: (toolName: string) => {
            const state = get()
            if (toolName === state.displayedTool)
                if (toolName === "node-info" && state.selectedNodeId)
                    set({ selectedNodeId: undefined })
                else 
                    set({ displayedTool: undefined })
            else if (toolName !== "node-info" && state.selectedNodeId)
                set({ displayedTool: toolName, selectedNodeId: undefined })
            else
                set({ displayedTool: toolName })
        },

        hideTools: () => set({ displayedTool: undefined }),

        onNodesChange: async (changes: NodeChange<RenderedNode>[]) => {
            const state = get()
            const api = new GraphAreaStateApi(state)
            if (state.lastAction === "graph-render")
                return set(api.layoutGraphAfterRender(changes))
            set(await api.applyNodeChanges(changes))
        },

        onEdgesChange: (changes: EdgeChange[]) => {
            set({ edges: applyEdgeChanges(changes, get().edges) })
        },

        selectNode: (id: string) => {
            const state = get()
            if (state.selectedNodeId === id && state.displayedTool === "node-info")
                set({ selectedNodeId: undefined })
            else if (state.selectedNodeId === id) {
                set({ selectedNodeId: undefined, displayedTool: undefined })
            } else {
                set({ selectedNodeId: id, displayedTool: "node-info" })
            }
        },

        onLayoutPress: (layout:  LayoutDirection) => {
            const api = new GraphAreaStateApi(get())
            api.setPreferredLayout(layout)
            const graph = api.layoutGraph()
            set({ ...graph, preferredLayout: layout })
        },

        addModuleToDag: async (module: ModuleNodeSpec) => {
            const api = new GraphAreaStateApi(get())
            set(await api.addModule(module))
        },

        deleteNodeModule(id) {
            const dag = get().dag
            const modules = R.filter(Object.entries(dag.modules), ([moduleId, _]) => moduleId !== id)
            set({ dag: { ...dag, modules: R.fromEntries(modules) } })
        },

        canBeDeleted: async ({ nodes, edges }: Graph) => {
            const modules = nodes.filter(node => node.type === "module")
            if (modules.length < 1) return false
            const api = new GraphAreaStateApi(get())
            const graph = await api.deleteModule(nodes, edges)
            set({ ...graph, selectedNodeId: undefined, displayedTool: undefined })
            return { nodes: [...modules], edges: [] }
        },

        runDagWithInputs: async (inputs: Record<string, CValue>) => {
            const state = get()
            const context = await EditorBackendApi.runDag(state.dag.metadata.name, inputs)
            const newNodes: RenderedNode[] = state.nodes.map((node) => {
                if (node.type == "data" && node.data.tag == "data") {
                    return { ...node, data: { ...node.data, cardProps: { ...node.data.cardProps, data: context.data[node.id] } } }
                } else if (node.type == "module" && node.data.tag == "module") {
                    return { ...node, data: { ...node.data, cardProps: { ...node.data.cardProps, status: context.moduleStatus[node.id], context: context } } }
                } else 
                    throw new Error("Unknown node type")
            })
            set({ nodes: newNodes, context, lastAction: "graph-render" })
            return context
        },

        cleanEngineContext: () => {
            const newNodes: RenderedNode[] = get().nodes.map((node) => {
                if (node.type == "data" && node.data.tag == "data") {
                    return { ...node, data: { ...node.data, cardProps: { ...node.data.cardProps, data: undefined } } }
                } else if (node.type == "module" && node.data.tag == "module") {
                    return {...node, data: { ...node.data, cardProps: { ...node.data.cardProps, status: undefined, context: undefined } }}
                } else 
                    throw new Error("Unknown node type")
            })
            set({ nodes: newNodes, context: undefined, lastAction: "graph-render" })
        }
    })
)

export const useInitGraphAreaState = (dagName: string) => {
    useEffect(() => {
        const s = useGraphAreaStore.getState()
        s.loadDag(dagName)
    }, [])
}