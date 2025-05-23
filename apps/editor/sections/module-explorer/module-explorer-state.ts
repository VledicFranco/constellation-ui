import { useEffect } from "react"
import { create } from "zustand"
import { persist, createJSONStorage } from 'zustand/middleware'
import * as R from 'remeda'

import { ExplorersModule } from "./module-explorer-dsl"
import EditorBackendApi from "../../editor-backend-api"

export type Panel = | "explorer" | "runner" | "none"

export type ModuleExplorerState = {
    modules: ExplorersModule[]
    panelShown: boolean
    activePanel: Panel
    loadModules: () => void
    togglePanel: (panel: Panel) => void

    // dag runner panel state
    dagRunnerPanelValues: Record<string, any>
    getRunnerPanelValue: (uuid: string) => any
    setDagRunnerPanelValue: (uuid: string, value: any) => void
    setDagRunnerPanelValues: (values: Record<string, any>) => void
    resetDagRunnerPanelValues: () => void
    forgetDagRunnerPanelValue: (uuid: string) => void
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

    // dag runner panel state
    dagRunnerPanelValues: {},
    getRunnerPanelValue(uuid) {
        const value = get().dagRunnerPanelValues[uuid]
        if (value === undefined) {
            return null
        }
        return value
    },
    setDagRunnerPanelValue: (uuid: string, value: any) => {
        set((state) => ({
            dagRunnerPanelValues: {
                ...state.dagRunnerPanelValues,
                [uuid]: value
            }
        }))
    },
    setDagRunnerPanelValues: (values: Record<string, any>) => {
        set({ dagRunnerPanelValues: values })
    },
    resetDagRunnerPanelValues: () => {
        set({ dagRunnerPanelValues: {} })
    },
    forgetDagRunnerPanelValue(uuid) {
        set((state) => {
            return { dagRunnerPanelValues: R.omit(state.dagRunnerPanelValues, [uuid]) }
        })
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