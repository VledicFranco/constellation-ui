import { useModuleBarState } from "./module-bar-state"

const ModuleBarApi = {

    addModule: () => 
        useModuleBarState.getState().addModule(),

}

export default ModuleBarApi