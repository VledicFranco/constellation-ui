import EditorApi from "../../editor-api"
import { ModuleBarThunk } from "./module-bar-state"
import * as ModuleBarState from "./module-bar-state"

const ModuleBarThunks = {

    getModules: (): ModuleBarThunk => async (dispatch) => {
        const modules = await EditorApi.getBarModules()
        dispatch(ModuleBarState.setModules(modules))
    }
}

export default ModuleBarThunks