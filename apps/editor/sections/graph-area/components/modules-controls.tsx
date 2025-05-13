import { ControlButton, Panel, PanelPosition } from "@xyflow/react";
import { Brain, Cog, Grab } from "lucide-react";

import cc from 'classcat';

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
}

export default function ModulesControls({
    position = 'bottom-left',
    orientation = 'vertical',
    'aria-label': ariaLabel = 'React Flow controls', }: ModulesControlsProperties) {

    const orientationClass = orientation === 'horizontal' ? 'horizontal' : 'vertical';

    return (
        <>
            <Panel
                className={cc(['react-flow__controls', orientationClass])}
                position={position}
                aria-label={ariaLabel}>
                <ControlButton
                    title='explore retrievers'
                    aria-label='explore retrievers'
                    onClick={() => { alert('Something magical just happened. ✨'); }}>
                    <Grab />
                </ControlButton>
                <ControlButton
                    title='explore models'
                    aria-label='explore models'
                    onClick={() => alert('Something magical just happened. ✨')}>
                    <Brain />
                </ControlButton>
                <ControlButton
                    title='explore the algorithms'
                    aria-label='explore the algorithms'
                    onClick={() => alert('Something magical just happened. ✨')}>
                    <Cog />
                </ControlButton>
            </Panel>
        </>
    );
};