import { addModule, dispatch } from "./module-bar-state"

const ModuleBarTransitions = {

    addModule: () => {
        dispatch(addModule("Mod"))
    }
}

export default ModuleBarTransitions