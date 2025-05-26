import { useEffect } from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'

import EditorBackendApi from "../../editor-backend-api"
import { ModuleNodeSpec } from "@/apps/common/dag-dsl"

export type ModuleExplorerState = {
    modules: ModuleNodeSpec[]
    selectedModule?: ModuleNodeSpec
    loadModules: () => void
    selectModule: (module?: ModuleNodeSpec) => void
}

export const useModuleExplorerState = create<ModuleExplorerState>()(persist((set, get) => ({
    modules: [],

    loadModules: async () => {
        const modules = await EditorBackendApi.getBarModules()
        set({ modules })
    },

    selectModule: (module?: ModuleNodeSpec) => {
        module && set({ selectedModule: module })
    }
}),
    {
        name: "editor/tool-module-explorer", // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
    }
))

export const useInitModuleExplorerState = () => {
    const loadModules = useModuleExplorerState((state) => state.loadModules)
    useEffect(() => {
        loadModules()
    }, [])
}
