import { GraphAreaView } from "./sections/graph-area"
import { ModuleExplorerView } from "./sections/module-explorer"

const EditorView = ({ dagName } : { dagName: string }) =>
    <GraphAreaView dagName={dagName}>
        <ModuleExplorerView />
    </GraphAreaView>

export default EditorView