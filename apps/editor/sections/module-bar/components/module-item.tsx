import { BarModule } from "../module-bar-dsl"

const ModuleItem = ({ module }: { module: BarModule }) => {
    return <div>{module.name}</div>
}

export default ModuleItem