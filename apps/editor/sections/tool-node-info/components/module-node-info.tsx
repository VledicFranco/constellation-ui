import { DagSpec, EngineContext, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Divider } from "@heroui/react"

interface DataNodeInfoProps {
    dag: DagSpec
    spec: ModuleNodeSpec
    context?: EngineContext
    status?: ModuleStatus
}

export default function ModuleNodeInfoView({ dag, spec, context, status }: DataNodeInfoProps) {
    return <Card>
        <CardHeader>
            <p>{spec.name}</p>
            <p>{spec.metadata.version}</p>
        </CardHeader>
        <Divider />
        <CardBody>
            <p>{spec.metadata.description}</p>
        </CardBody>
    </Card>
}