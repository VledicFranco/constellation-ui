import ModuleItem from "./components/module-item"
import { useEffect } from "react"
import { useModuleBarState } from "./module-bar-state"

const useInitialModuleBarLoader = () => {
    const loadModules = useModuleBarState((state) => state.loadModules)
    useEffect(() => {
        loadModules()
    }, [])
}

const ModuleBarView = ({ className }: { className?: string }) => {
    useInitialModuleBarLoader() 
    const modules = useModuleBarState((state) => state.modules)
    return <div className={className}>
        {modules.map((module) =>
            <ModuleItem key={module.name} module={module} />
        )}
    </div>
}

export default ModuleBarView
