import { create } from "zustand"
import { ExplorersModule } from "./module-explorer-dsl"
import { persist, createJSONStorage } from 'zustand/middleware'
import EditorBackendApi from "../../editor-backend-api"

export type ModuleExplorerState = {
    modules: ExplorersModule[]
    panelShown: boolean
    loadModules: () => void
    togglePanel: () => void
}

export const useModuleExplorerState = create<ModuleExplorerState>()(persist((set, get) => ({

    modules: [],
    panelShown: false,

    loadModules: async () => {
        const modules = await EditorBackendApi.getBarModules()
        set({modules})
    },

    togglePanel: () => {
        set((state) => ({ panelShown: !state.panelShown }))
    },
}),
{
    name: "editor/module-bar-storage", // name of the item in the storage (must be unique)
    storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
}
))
