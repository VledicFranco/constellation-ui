import { Provider } from "react-redux"
import ModuleItem from "./components/module-item"
import { moduleBarStore, useModuleBarSelector } from "./module-bar-state"
import { useEffect } from "react"
import ModuleBarTransitions from "./module-bar-transitions"

const useInitialModuleBarLoader = () =>
    useEffect(() => {
        ModuleBarTransitions.getModules()
    }, [])

const ModuleBar = ({ className }: { className?: string }) => {
    useInitialModuleBarLoader() 
    const modules = useModuleBarSelector((state) => state.modules)
    return <div className={className}>
        {modules.map((module) =>
            <ModuleItem key={module.name} module={module} />
        )}
    </div>
}

const ModuleBarView = ({ className }: { className?: string }) => 
    <Provider store={moduleBarStore}>
        <ModuleBar className={className} />
    </Provider>

export default ModuleBarView
