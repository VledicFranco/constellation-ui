import { create } from "zustand"
import { BarModule } from "./module-bar-dsl"
import { persist, createJSONStorage } from 'zustand/middleware'
import EditorBackendApi from "../../editor-backend-api"
import { StubModules } from "@/apps/common/stubs"

export type ModuleBarState = {
    modules: BarModule[]

    loadModules: () => void
}

export const useModuleBarState = create<ModuleBarState>()(persist((set, get) => ({

    modules: StubModules() as BarModule[],

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
