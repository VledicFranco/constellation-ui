import { ControlButton, Panel } from "@xyflow/react";
import { MoveHorizontal, MoveVertical } from "lucide-react";
import { CSSProperties } from "react";

interface LayoutPanelProps {
    onLayoutPress: (direction: "TB" | "LR") => void
}

export default function LayoutPanel({ onLayoutPress }: LayoutPanelProps) {
    return (
        <Panel id="explorer-toggle-button"
            className={"vertical rounded-sm w-60"}
            position={"top-left"}
            aria-label="Module Explorer toggle button">
            <ControlButton
                title="vertical layout"
                aria-label="vertical layout"
                onClick={() => onLayoutPress("LR")}
                style={{ width: "40px", height: "40px" } as CSSProperties}>
                <MoveHorizontal style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
            </ControlButton>
            <ControlButton
                title="vertical layout"
                aria-label="vertical layout"
                onClick={() => onLayoutPress("TB")}
                style={{ width: "40px", height: "40px" } as CSSProperties}>
                <MoveVertical style={{ fill: "none", maxWidth: "20px", maxHeight: "20px" } as CSSProperties} />
            </ControlButton>
        </Panel>
    )
}
