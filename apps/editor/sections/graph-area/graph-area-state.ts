import { CValue, DagSpec, emptyDag, EngineContext, ModuleNodeSpec } from "@/apps/common/dag-dsl"
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
    displayedTool?: string
    preferredLayout: LayoutDirection 
    lastAction?: RenderAction

    loadDag: (name: string) => Promise<void>
    diplayTool: (toolName: string) => void
    hideTools: () => void

    onNodesChange: (changes: NodeChange<RenderedNode>[]) => Promise<void>
    onEdgesChange: (changes: EdgeChange[]) => void

    onLayoutPress: (layout: LayoutDirection) => void
    addModuleToDag: (module: ModuleNodeSpec) => Promise<void>
    deleteNodeModule: (id: string) => void
    canBeDeleted: ({ nodes, edges }: Graph) => Promise<boolean | Graph>
    runDagWithInputs: (inputs: Record<string, CValue>) => Promise<EngineContext>
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

        diplayTool: (toolName: string) => {
            if (toolName === get().displayedTool)
                set({ displayedTool: undefined })
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
            set(await api.deleteModule(nodes, edges))
            return { nodes: [...modules], edges: [] }
        },

        runDagWithInputs: async (inputs: Record<string, CValue>) => {
            const state = get()
            const context = await EditorBackendApi.runDag(state.dag.name, inputs)
            const newNodes: RenderedNode[] = state.nodes.map((node) => {
                if (node.type == "data" && node.data.tag == "data") {
                    return { ...node, data: { ...node.data, value: context.loadedData[node.id] } }
                } else if (node.type == "module" && node.data.tag == "module") {
                    return {...node, data: { ...node.data, status: context.moduleStatus[node.id] }}
                } else 
                    throw new Error("Unknown node type")
            })
            set({ nodes: newNodes, lastAction: "graph-render" })
            return context
        },

        cleanEngineContext: () => {
            const newNodes: RenderedNode[] = get().nodes.map((node) => {
                if (node.type == "data" && node.data.tag == "data") {
                    return { ...node, data: { ...node.data, value: undefined } }
                } else if (node.type == "module" && node.data.tag == "module") {
                    return {...node, data: { ...node.data, status: undefined }}
                } else 
                    throw new Error("Unknown node type")
            })
            set({ nodes: newNodes, lastAction: "graph-render" })
        }
    })
)

export const useInitGraphAreaState = (dagName: string) => {
    useEffect(() => {
        const s = useGraphAreaStore.getState()
        s.loadDag(dagName)
    }, [])
}