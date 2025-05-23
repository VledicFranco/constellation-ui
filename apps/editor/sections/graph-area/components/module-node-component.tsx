import { ModuleStatus } from "@/apps/common/dag-dsl";
import { RenderedNodeProps } from "../graph-area-dsl";
import { Handle, NodeToolbar, Position } from "@xyflow/react";
import { Info } from "lucide-react";
import { CSSProperties } from "react";
import { Chip } from "@heroui/chip";


export default function ModuleNodeComponent({ data }: RenderedNodeProps) {
    if (data.tag !== "module") throw new Error("Invalid node type")

    const moduleTagChipClass = (status: ModuleStatus) => {
        switch (status.tag) {
            case "fired":
                return "success";
            case "failed":
                return "danger";
            case "timed":
                return "warning";
            case "unfired":
                return "warning";
            default:
                return "default";
        }
    }

    const message = (status: ModuleStatus) => {
        switch (status.tag) {
            case "fired":
                return "fired: " + status.latency + "ms";
            case "failed":
                return "error: " + status.error;
            case "timed":
                return "timed: " + status.latency + "ms";
            case "unfired":
                return "unfired";
            default:
                return "default";
        }
    }

    const handlePositionTarget = data.preferredLayout === "TB" ? Position.Top : Position.Left
    const handlePositionSource = data.preferredLayout === "TB" ? Position.Bottom : Position.Right

    return <>
        <NodeToolbar
            className="border-gray-300 border-1 rounded-sm shadow-md"
            isVisible={false}
            position={Position.Right}
        >
            <button onClick={() => {
                // TODO: open module explorer
            }}>
                <Info style={{ fill: "none", maxWidth: "15px", maxHeight: "15px" } as CSSProperties} />
            </button>
        </NodeToolbar >
        <div>
            <Handle type="target" position={handlePositionTarget} isConnectable={false} />
            <div className="grid grid-cols-1 gap-1">
                <div className="node-header">{data.name}</div>
                {data.status && (
                    <div className="node-value">
                        <Chip size="sm" variant="flat" color={moduleTagChipClass(data.status)}>{message(data.status)}</Chip>
                    </div>
                )}
            </div>
            <Handle type="source" position={handlePositionSource} isConnectable={false} />
        </div >
    </>
}