import * as R from "remeda"
import Dagre from "@dagrejs/dagre"
import { CValue, DagSpec, DataNodeSpec, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { applyEdgeChanges, applyNodeChanges, Edge, EdgeChange, getIncomers, getOutgoers, MarkerType, Node, NodeChange, NodeProps, Position } from "@xyflow/react"
import { GraphAreaState } from "./graph-area-state"
import EditorBackendApi from "../../editor-backend-api"

export type RenderedNode = Node<DataNodePayload | ModuleNodePayload, RenderedNodeType>

export type RenderedNodeProps = NodeProps<RenderedNode>

export type DataNodePayload = DataNodeSpec & CommonPayload & {
    tag: "data"
    value?: CValue
}

export type ModuleNodePayload = ModuleNodeSpec & CommonPayload & {
    tag: "module"
    status?: ModuleStatus
}

export type CommonPayload = {
    preferredLayout: LayoutDirection 
}

export type Graph = { nodes: RenderedNode[], edges: Edge[] }

export type GraphRender = Graph & { dag: DagSpec, lastAction: RenderAction }

export type RenderedNodeType = "data" | "module"

export type LayoutDirection = "TB" | "LR"

export type RenderAction 
    = "nothing"
    | "set-layout" 
    | "graph-render"

type StateChange = { 
    nodeChanges: NodeChange<RenderedNode>[], 
    edgeChanges: EdgeChange[], 
    dagChanged?: DagSpec 
}

export class GraphAreaStateApi {

    dag: DagSpec

    graph: Graph

    preferredLayout: LayoutDirection

    constructor(state: GraphAreaState) {
        this.graph = { nodes: state.nodes, edges: state.edges }
        this.dag = state.dag
        this.preferredLayout = state.preferredLayout
    }

    private createEdge(source: string, target: string): Edge {
        return {
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
        }
    }

    setNodes(nodes: RenderedNode[]): void {
        this.graph.nodes = nodes
    }

    setEdges(edges: Edge[]): void {
        this.graph.edges = edges
    }

    findNode(id: string): RenderedNode {
        const node = this.graph.nodes.find((n) => n.id === id)
        if (!node) throw new Error(`Node with id ${id} not found, this is a bug and should never happen.`)
        return node
    }

    intersectingNodesOf(node: RenderedNode): RenderedNode[] {
        const x = node.position.x
        const y = node.position.y
        const width = node.measured?.width ?? 0
        const height = node.measured?.height ?? 0

        return this.graph.nodes.filter((n) => {
            if (n.id === node.id) return false
            const nX = n.position.x
            const nY = n.position.y
            const nWidth = n.measured?.width ?? 0
            const nHeight = n.measured?.height ?? 0

            return x < nX + nWidth && x + width > nX && y < nY + nHeight && y + height > nY
        })
    }

    layoutGraphAfterRender(changes: NodeChange<RenderedNode>[]): Graph & { lastAction?: RenderAction } {
        const changedNodes = applyNodeChanges(changes, this.graph.nodes)
        this.graph.nodes = changedNodes
        const layout = this.layoutNodes()
        return { ...layout, lastAction: undefined }
    }
    
    layoutNodes(): Graph {
        const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))
        g.setGraph({ rankdir: this.preferredLayout })

        this.graph.edges.forEach((edge) => g.setEdge(edge.source, edge.target));
        this.graph.nodes.forEach((node) =>
            g.setNode(node.id, {
                ...node,
                width: node.measured?.width ?? 0,
                height: node.measured?.height ?? 0,
            }),
        )

        Dagre.layout(g)

        const newNodes = this.graph.nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { 
                ...node, 
                data: { ...node.data, preferredLayout: this.preferredLayout }, 
                position: { x, y },
                sourcePosition: this.preferredLayout === "TB" ? Position.Bottom : Position.Right,
                targetPosition: this.preferredLayout === "TB" ? Position.Top : Position.Left,
            };
        })

        this.graph.nodes = newNodes

        return { nodes: newNodes, edges: this.graph.edges }
    }

    renderDag(): GraphRender {
        const graphNodesDict = R.indexBy(this.graph.nodes, (node) => node.id)
        /* Add new module nodes */
        const moduleNodes: RenderedNode[] = Object.entries(this.dag.modules).map(([uuid, spec], index) => {
            const stateNode = graphNodesDict[uuid]
            if (stateNode) return stateNode
            else return {
                id: uuid,
                type: "module", // Make sure this matches exactly with the nodeTypes in the view
                data: { tag: "module", ...spec, preferredLayout: this.preferredLayout }, // Include id in data for easier access
                position: { x: 250, y: index * 100 + 50 },
            }
        })
        /* Add new data nodes */
        const dataNodes: RenderedNode[] = Object.entries(this.dag.data).map(([uuid, spec], index) => {
            const stateNode = graphNodesDict[uuid]
            if (stateNode) return stateNode
            else return {
                id: uuid,
                type: "data", // Make sure this matches exactly with the nodeTypes in the view
                data: { tag: "data", ...spec, preferredLayout: this.preferredLayout }, // Include id in data for easier access
                position: { x: 50, y: index * 100 + 50 },
            }
        })
        /** Keed RenderedNodes that didn't change. */
        const keptNodes: RenderedNode[] = this.graph.nodes.filter((node) => {
            if (node.type === "module") 
                return this.dag.modules[node.id] !== undefined
            else 
                return this.dag.data[node.id] !== undefined
        })

        const newNodes = [...moduleNodes, ...dataNodes, ...keptNodes]

        const newEdges = [...this.dag.inEdges, ...this.dag.outEdges]
            .map(([source, target]) => this.createEdge(source, target))

        this.graph.nodes = newNodes
        this.graph.edges = newEdges

        return { dag: this.dag, nodes: newNodes, edges: newEdges, lastAction: "graph-render" }
    }

    async applyNodeChanges(changes: NodeChange<RenderedNode>[]): Promise<GraphRender> {
        const { nodeChanges, edgeChanges, dagChanged } = this.computeNodeStateChanges(changes)
        this.graph.nodes = applyNodeChanges(nodeChanges, this.graph.nodes)
        this.graph.edges = applyEdgeChanges(edgeChanges, this.graph.edges)
        if (dagChanged) {
            this.dag = dagChanged
            const graph = this.layoutNodes()
            await EditorBackendApi.saveDag(dagChanged)
            return {
                dag: this.dag,
                ...graph,
                lastAction: "set-layout",
            }
        } else return {
            dag: this.dag,
            nodes: this.graph.nodes,
            edges: this.graph.edges,
            lastAction: "nothing",
        }
    }

    private computeNodeStateChanges(originalChanges: NodeChange<RenderedNode>[]): StateChange {
        const applyChanges: (dag: DagSpec, change: NodeChange<RenderedNode>) => StateChange = (dag, change) => {
            /** When the change is just dragging, continue. */
            if (change.type === "position" && change.dragging) 
                return this.stateChangeNodeOnly(change)
            /** When stopped dragging. */
            if (change.type === "position" && !change.dragging) {
                const draggingNode = this.findNode(change.id)
                /** Continue if types don't match. */
                if (draggingNode.type !== "data") 
                    return this.stateChangeNodeOnly(change)
                /** If the landing node is not a data node, continue. */
                const intersectingNode = this.intersectingNodesOf(draggingNode)[0]
                if (intersectingNode && intersectingNode.type !== "data") 
                    return this.stateChangeNodeOnly(change)
                /** Merge if it landed on a data node with same type. */
                // TODO: Needs to check for cyclic dependencies.
                if (intersectingNode && intersectingNode.type === "data")
                    return this.mergeDataNodes(draggingNode, intersectingNode, change, dag)
                else 
                    return this.stateChangeNodeOnly(change)
            } 
            else return this.stateChangeNodeOnly(change)
        }
        const computed = originalChanges.reduce((acc, change) => {
            const stateChange = applyChanges(acc.dagChanged ?? this.dag, change)
            return {
                dagChanged: stateChange.dagChanged,
                nodeChanges: [...acc.nodeChanges, ...stateChange.nodeChanges],
                edgeChanges: [...acc.edgeChanges, ...stateChange.edgeChanges],
            }
        }, { nodeChanges: [], edgeChanges: [] } as StateChange)
        return computed
    }

    private stateChangeNodeOnly(change: NodeChange<RenderedNode>): StateChange {
        return { 
            nodeChanges: [change],
            edgeChanges: [],
            dagChanged: undefined,
        }
    }

    private mergeDataNodes(sourceNode: RenderedNode, targetNode: RenderedNode, originalChange: NodeChange<RenderedNode>, dag: DagSpec): StateChange {
        const dagTargetNode = dag.data[targetNode.id]
        const dagSourceNode = dag.data[sourceNode.id]
        const isSameType = R.isDeepEqual(dagTargetNode.cType, dagSourceNode.cType)
        if (!isSameType) return this.stateChangeNodeOnly(originalChange)

        const removeSourceNode: NodeChange<RenderedNode> = { type: "remove", id: sourceNode.id }
        const incomers = getIncomers(sourceNode, this.graph.nodes, this.graph.edges)
        const addInEdgesToTarget: EdgeChange[] = incomers.map((n) =>
            ({ type: "add", item: this.createEdge(n.id, targetNode.id) }))
        const outgoers = getOutgoers(sourceNode, this.graph.nodes, this.graph.edges)
        const addOutEdgesToTarget: EdgeChange[] = outgoers.map((n) => 
            ({ type: "add", item: this.createEdge(targetNode.id, n.id) }))

        const newDagInEdges: [string, string][] = this.dag.inEdges.map(([sourceData, targetModule]) => {
            if (sourceData === sourceNode.id) return [targetNode.id, targetModule]
            else return [sourceData, targetModule]
        })
        const newDagOutEdges: [string, string][] = this.dag.outEdges.map(([sourceModule, targetData]) => {
            if (targetData === sourceNode.id) return [sourceModule, targetNode.id]
            else return [sourceModule, targetData]
        })
        const newDataNode: DataNodeSpec = {
            ...dagTargetNode,
            nicknames: { ...dagTargetNode.nicknames, ...dagSourceNode.nicknames },
        }
        const newDataNodes: Record<string, DataNodeSpec> = 
            { ...R.omit(this.dag.data, [sourceNode.id]), [targetNode.id]: newDataNode }
        const newDag: DagSpec = {
            ...dag,
            data: newDataNodes,
            inEdges: newDagInEdges,
            outEdges: newDagOutEdges,
        }

        return {
            nodeChanges: [removeSourceNode],
            edgeChanges: [...addInEdgesToTarget, ...addOutEdgesToTarget],
            dagChanged: newDag,
        }
    }
}
