import { Action, configureStore, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { BarModule } from "./module-bar-dsl"
import { useSelector } from "react-redux"

export interface ModuleBarState {
    modules: BarModule[]
}

export type ModuleBarStoreState =
    ReturnType<typeof moduleBarStore.getState> // Includes Thunks Middleware

export type ModuleBarThunk<ReturnType = void> = 
    ThunkAction<ReturnType, ModuleBarStoreState, unknown, Action<string>>

const moduleBarInitialState: ModuleBarState = {
    modules: [],
}

export const moduleBarState = createSlice({
    name: "module-bar-state",
    initialState: moduleBarInitialState,
    reducers: {
        addModule: (state, action: PayloadAction<string>) => {
            const n = state.modules.length
            state.modules.push({name: `${action.payload} ${n + 1}`})
        }
    },
})

export const moduleBarStore = configureStore({
    reducer: moduleBarState.reducer,
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})

export const { addModule } = moduleBarState.actions

export const dispatch = moduleBarStore.dispatch

export const useModuleBarSelector = <Selection = unknown>(selector: (state: ModuleBarState) => Selection) => 
    useSelector<ModuleBarState, Selection>(selector)