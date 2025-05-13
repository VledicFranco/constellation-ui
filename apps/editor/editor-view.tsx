import { GraphAreaView } from "./sections/graph-area"
import { ModuleExplorerView } from "./sections/module-explorer"

const EditorView = () => 
    <section className="flex gap-4">
        <GraphAreaView>
            <ModuleExplorerView />
        </GraphAreaView>
    </section>

export default EditorView