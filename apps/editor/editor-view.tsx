import { GraphAreaView } from "./sections/graph-area"
import { ModuleExplorerView } from "./sections/module-explorer"

const EditorView = ({ dagName } : { dagName: string }) =>
    <section id="editor-view" className="flex gap-4">
        <GraphAreaView dagName={dagName}>
            <ModuleExplorerView />
        </GraphAreaView>
    </section>

export default EditorView