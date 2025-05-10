import { ModuleBarThunk } from "./module-bar-state";
import ModuleBarTransitions from "./module-bar-transitions";

const ModuleBarThunks = {

    /** This is an example of a thunk, you can make async/await calls mostly to APIs to update the store. */
    addModule: (): ModuleBarThunk => (dispatch, getState) => {
        ModuleBarTransitions.addModule()
    }
}

export default ModuleBarThunks