import { addModule, dispatch } from "./module-bar-state"
import ModuleBarThunks from "./module-bar-thunks"

const ModuleBarTransitions = {

    addModule: () => dispatch(addModule("Mod")),

    getModules: () => dispatch(ModuleBarThunks.getModules()),
}

export default ModuleBarTransitions