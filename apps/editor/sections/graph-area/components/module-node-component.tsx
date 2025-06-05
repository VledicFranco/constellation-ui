import { ModuleStatus } from "@/apps/common/dag-dsl";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/react";
import { Handle, Position } from "@xyflow/react";
import cc from "classcat";
import { BadgeCheck, Bomb, ClockAlert, Component } from "lucide-react";
import { RenderedNodeProps } from "../graph-area-dsl";
import { useGraphAreaStore } from "../graph-area-state";
import { useShallow } from "zustand/react/shallow";

function ModuleIcon({ status }: { status?: ModuleStatus }) {
    switch (status?.tag) {
        case "Fired":
            return <BadgeCheck size="12" className="text-success-500" />
        case "Failed":
            return <Bomb size="12" className="text-danger-500" />
        case "Timed":
            return <ClockAlert size="12" className="text-warning-500" />
        case "Unfired":
            return <Component size="12" className="text-default-500" />
        default:
            return <Component size="12" className="text-default-500" />
    }
}

function borderClass(status?: ModuleStatus) {
    switch (status?.tag) {
        case "Fired":
            return "border-success-200";
        case "Failed":
            return "border-danger-200";
        case "Timed":
            return "border-warning-200";
        default:
            return "border-secondary-300";
    }
}

export default function ModuleNodeComponent({ id, data }: RenderedNodeProps) {
    if (data.tag !== "module") throw new Error("Invalid node type")

    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right
    const isSelected = useGraphAreaStore(useShallow((state) => state.selectedNodeId === id))
    const borderType = isSelected ? "outline-double outline-3 outline-offset-2" : "outline-solid"

    return <>
        <div>
            <Card radius="sm" shadow="md" className={cc([borderClass(data.status), borderType, "border-1"])}>
                <CardBody className="px-4 py-2 flex-col items-start gap-5">
                    <Handle type="target" position={handlePositionTarget} isConnectable={false} />
                    <div className="flex flex-row gap-2 items-center">
                        <ModuleIcon status={data.status} />
                        <div className="flex flex-row gap-1">
                            <p className="block text-md font-bold text-sm">{data.metadata.name}</p>
                            <small className="block text-default-500">v{data.metadata.majorVersion}.{data.metadata.minorVersion}</small>
                        </div>
                    </div>
                    <div className="flex flex-row gap-1">
                        {data.metadata.tags.map((tag, index) => (
                            <Chip
                                key={index}
                                size="sm"
                                variant="flat"
                                color="default"
                                className="text-xs"
                            >
                                <small className="text-default-500">{tag}</small>
                            </Chip>
                        ))}
                    </div>
                    <Handle type="source" position={handlePositionSource} isConnectable={false} />
                </CardBody>
            </Card>
        </div >
    </>
}
