import { ModuleNodeSpec } from "@/apps/common/dag-dsl";
import { useGraphAreaStore } from "./graph-area-state";

const GraphAreaApi = {

    addModule: (module: ModuleNodeSpec) =>
        useGraphAreaStore.getState().addModuleToDag(module),

    getDagInputs: () =>
        useGraphAreaStore.getState().getDagInputs(),
}

export default GraphAreaApi
