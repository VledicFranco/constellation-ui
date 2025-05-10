import { GraphAreaView } from "./sections/graph-area"
import { ModuleBarView } from "./sections/module-bar"

const EditorView = () => 
    <section className="flex gap-4">
        <ModuleBarView />
        <GraphAreaView />
    </section>

export default EditorView