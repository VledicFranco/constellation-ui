import { create } from "zustand"
import { BarModule } from "./module-bar-dsl"
import { persist, createJSONStorage } from 'zustand/middleware'
import EditorBackendApi from "../../editor-backend-api"

export type ModuleBarState = {
    modules: BarModule[]

    addModule: () => void
    loadModules: () => void
}

export const useModuleBarState = create<ModuleBarState>()(persist((set, get) => ({

    modules: [] as BarModule[],

    addModule: () => {
        const n = get().modules.length
        set((state) => ({
            modules: [...state.modules, { name: `Mod ${n + 1}` }]
        }))
    },

    loadModules: async () => {
        const modules = await EditorBackendApi.getBarModules()
        set({modules})
    },
}),
{
    name: "editor/module-bar-storage", // name of the item in the storage (must be unique)
    storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
}
))
