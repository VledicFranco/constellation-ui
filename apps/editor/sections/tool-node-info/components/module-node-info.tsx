import { DagSpec, EngineContext, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Chip, Code, Divider } from "@heroui/react"
import { BadgeCheck, Bomb, ClockAlert, Component } from "lucide-react"

export function ModuleIcon({ status }: { status?: ModuleStatus }) {
    switch (status?.tag) {
        case "fired":
            return <BadgeCheck size="18" className="text-success-500" />
        case "failed":
            return <Bomb size="18" className="text-danger-500" />
        case "timed":
            return <ClockAlert size="18" className="text-warning-500" />
        case "unfired":
            return <Component size="18" className="text-default-500" />
        default:
            return <Component size="18" className="text-default-500" />
    }
}

function Status({ status }: { status: ModuleStatus }) {
    if (status.tag === "fired")
        return <Code color="success">Fired: {status.latency}ms</Code>
    else if (status.tag === "failed")
        return <Code color="danger" className="max-w-lg text-wrap">Failed: {status.error}</Code>
    else if (status.tag === "timed")
        return <Code color="warning">Timed: {status.latency}ms</Code>
    else
        return <Code color="default">Unfired</Code>
}

interface DataNodeInfoProps {
    dag: DagSpec
    spec: ModuleNodeSpec
    context?: EngineContext
    status?: ModuleStatus
}

export default function ModuleNodeInfoView({ dag, spec, context, status }: DataNodeInfoProps) {
    return <Card>
        <CardHeader>
            <div className="flex flex-row gap-2 items-center">
                <ModuleIcon status={status} />
                <div className="flex flex-row gap-1">
                    <p className="text-lg font-bold">{spec.name}</p>
                    <small className="block text-default-500">v{spec.metadata.version}</small>
                </div>
            </div>
        </CardHeader>
        <Divider />
        <CardBody>
            <div className="flex flex-row gap-1">
                {spec.metadata.tags.map((tag, index) => (
                    <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="default"
                        className="text-sm text-default-500"
                    >
                        {tag}
                    </Chip>
                ))}
            </div>
            { (context && status) && <>
                <p className="text-sm text-default-500 mt-3 mb-1">Status</p>
                <Status status={status} />
            </>}
            <p className="text-sm text-default-500 mt-3 mb-1">Description</p>
            <p className="text-md text-default-800 max-w-lg text-wrap">{spec.metadata.description}</p>
        </CardBody>
    </Card>
}