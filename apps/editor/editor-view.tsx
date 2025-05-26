import { Component, PlayCircle } from "lucide-react"
import { GraphAreaView } from "./sections/graph-area"
import { ToolModuleExplorerView } from "./sections/tool-module-explorer"
import { ToolDagRunnerView } from "./sections/tool-dag-runner"
import { ToolComponentMap } from "./sections/graph-area/graph-area-dsl"
import { CSSProperties } from "react"

const toolComponentMap: ToolComponentMap = {
    "module-explorer": {
        title: "Module Explorer",
        ariaLabel: "Module Explorer",
        component: <ToolModuleExplorerView />,
        icon: <Component style={{ fill: 'none', maxWidth: '40px', maxHeight: '40px' } as CSSProperties} />,
    },
    "dag-runner": {
        title: "DAG Runner",
        ariaLabel: "DAG Runner",
        component: <ToolDagRunnerView />,
        icon: <PlayCircle style={{ fill: 'none', maxWidth: '40px', maxHeight: '40px' } as CSSProperties} />,
    },
}

const EditorView = ({ dagName } : { dagName: string }) =>
    <GraphAreaView dagName={dagName} toolComponentMap={toolComponentMap} />

export default EditorView
