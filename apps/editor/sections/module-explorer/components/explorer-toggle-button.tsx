import { ControlButton, Panel, PanelPosition } from "@xyflow/react";
import { Cog, PlayCircle } from "lucide-react";

import cc from 'classcat';
import React, { CSSProperties, MouseEventHandler } from "react";
import { Panel as ExplorerPanel } from "../module-explorer-state";

export type ExplorerToggleButtonProperties = {
    position?: PanelPosition
    orientation?: 'horizontal' | 'vertical'
    onClick: (panel: ExplorerPanel) => void
}

export default function ExplorerToggleButton({
    position = "bottom-left",
    orientation = "vertical",
    onClick
}: ExplorerToggleButtonProperties) {
    return <Panel id="explorer-toggle-button"
        className={cc([orientation, 'border-gray-300 border-1 rounded-sm w-60'])}
        position={position}
        aria-label="Module Explorer toggle button">
        <ControlButton
            title='Toggle module explorer'
            aria-label='Toggle module explorer'
            onClick={() => onClick("explorer")}
            style={{ width: '40px', height: '40px' } as CSSProperties}>
            <Cog style={{ fill: 'none', maxWidth: '20px', maxHeight: '20px' } as CSSProperties} />
        </ControlButton>

        <ControlButton
            title='Play DAG'
            aria-label='Play DAG'
            onClick={() => onClick("runner")}
            style={{ width: '40px', height: '40px' } as CSSProperties}>
            <PlayCircle style={{ fill: 'none', maxWidth: '20px', maxHeight: '20px' } as CSSProperties} />
        </ControlButton>
    </Panel>
}