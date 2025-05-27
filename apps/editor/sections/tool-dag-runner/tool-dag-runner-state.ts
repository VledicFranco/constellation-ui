import { create } from "zustand"
import * as R from 'remeda'
import { CValue, DagSpec, DataNodeSpec, EngineContext, getDagInputs } from "@/apps/common/dag-dsl"
import { cTypeDefaultValue } from "./tool-dag-runner-dsl"

export type ToolDagRunnerState = {
    values: Record<string, [string, CValue]>
    specs: [string, DataNodeSpec][]
    engineContext?: EngineContext
    isSubmitting: boolean
    getValue(uuid: string): [string, CValue] | undefined
    setValue(uuid: string, value: CValue): void
    resetValues(): void
    forgetValues(uuid: string): void
    setInputSpecs(dag: DagSpec): void
    setEngineContext(engineContext?: EngineContext): void
    runDag(callback: (inputs: Record<string, CValue>) => Promise<EngineContext>): Promise<void>
}

export const useToolDagRunnerState = create<ToolDagRunnerState>()((set, get) => ({
    values: {},
    specs: [],
    engineContext: undefined,
    isSubmitting: false,

    getValue: (uuid) => 
        get().values[uuid],

    setValue: (uuid: string, value: CValue) =>
        set((state) => ({
            values: {
                ...state.values,
                [uuid]: [state.values[uuid]?.[0] ?? "impossible", value]
            }
        })),

    resetValues: () => 
        set({ values: {} }),

    forgetValues: (uuid) =>
        set((state) => {
            return { values: R.omit(state.values, [uuid]) }
        }),


    setInputSpecs: (dag: DagSpec) => {
        const specs = getDagInputs(dag)
        const values = specs.reduce((acc, [uuid, spec]) => 
            ({ ...acc, [uuid]: [spec.name, cTypeDefaultValue(spec.cType)] })
        , {} as Record<string, [string, CValue]>)
        set({ specs, values })
    },

    setEngineContext: (engineContext?: EngineContext) =>
        set({ engineContext }),

    setIsSubmitting: (isSubmitting: boolean) => 
        set({ isSubmitting }),

    runDag: async (callback: (inputs: Record<string, CValue>) => Promise<EngineContext>) => {
        const state = get()
        set({ isSubmitting: true })
        try {
            const data = R.fromEntries(Object.values(state.values))
            const result = await callback(data)
            set({ engineContext: result })
        } finally {
            set({ isSubmitting: false })
        }
    }
}))
