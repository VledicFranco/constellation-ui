import { create } from "zustand"
import { ExplorersModule } from "./module-explorer-dsl"
import { persist, createJSONStorage } from 'zustand/middleware'
import EditorBackendApi from "../../editor-backend-api"
import { useEffect } from "react"

export type Panel = | "explorer" | "runner" | "none"

export type ModuleExplorerState = {
    modules: ExplorersModule[]
    panelShown: boolean
    activePanel: Panel
    loadModules: () => void
    togglePanel: (panel: Panel) => void
}

export const useModuleExplorerState = create<ModuleExplorerState>()(persist((set, get) => ({

    modules: [],
    panelShown: false,
    activePanel: "none",

    loadModules: async () => {
        const modules = await EditorBackendApi.getBarModules()
        set({ modules })
    },

    togglePanel: (panel: Panel) => {
        set((state) => ({ panelShown: !state.panelShown, activePanel: panel }))
    },
}),
    {
        name: "editor/module-bar-storage", // name of the item in the storage (must be unique)
        storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
    }
))

export const useInitModuleExplorerState = () => {
    const loadModules = useModuleExplorerState((state) => state.loadModules)
    useEffect(() => {
        loadModules()
    }, [])
}