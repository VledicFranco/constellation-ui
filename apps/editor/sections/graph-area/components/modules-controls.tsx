import { ControlButton, Panel, PanelPosition } from "@xyflow/react";
import { Cog } from "lucide-react";

import cc from 'classcat';
import React, { CSSProperties } from "react";

export type ModulesControlsProperties = {
    position?: PanelPosition;

    /**
       * @default 'React Flow controls'
       */
    'aria-label'?: string;

    /**
     * @default 'vertical'
     */
    orientation?: 'horizontal' | 'vertical';

    onButtonClick: (moduleType: ModuleTypes) => void;
}

export type ModuleTypes = | 'retriever' | 'model' | 'algorithm';

export default function ModulesControls({
    position = 'bottom-left',
    orientation = 'vertical',
    'aria-label': ariaLabel = 'module explorer cog',
    onButtonClick = (moduleType) => { alert('Something magical just happened. ' + moduleType); }
}: ModulesControlsProperties) {

    const orientationClass = orientation === 'horizontal' ? 'horizontal' : 'vertical';

    return (
        <>
            <Panel
                className={cc([orientationClass, 'border-gray-300 border-1 rounded-sm w-60'])}
                position={position}
                aria-label={ariaLabel}>
                <ControlButton
                    title='explore retrievers'
                    aria-label='explore retrievers'
                    onClick={() => onButtonClick('retriever')}
                    style={{ width: '40px', height: '40px' } as CSSProperties}>
                    <Cog style={{ fill: 'none', maxWidth: '20px', maxHeight: '20px' } as CSSProperties} />
                </ControlButton>
            </Panel>
        </>
    );
};