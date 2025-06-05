import { useEffect } from "react"
import { create } from "zustand"

import EditorBackendApi from "../../editor-backend-api"
import { ModuleNodeSpec } from "@/apps/common/dag-dsl"

export type ModuleExplorerState = {
    modules: ModuleNodeSpec[]
    selectedModule?: ModuleNodeSpec
    loadModules: () => void
    selectModule: (module?: ModuleNodeSpec) => void
}

export const useModuleExplorerState = create<ModuleExplorerState>()((set, get) => ({
    modules: [],

    loadModules: async () => {
        const modules = await EditorBackendApi.getBarModules()
        set({ modules })
    },

    selectModule: (module?: ModuleNodeSpec) => {
        module && set({ selectedModule: module })
    }
}))

export const useInitModuleExplorerState = () => {
    const loadModules = useModuleExplorerState((state) => state.loadModules)
    useEffect(() => {
        loadModules()
    }, [])
}
