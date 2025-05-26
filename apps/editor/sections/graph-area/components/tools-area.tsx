import { Card, CardBody } from "@heroui/react";
import { Panel } from "@xyflow/react";
import cc from "classcat";
import { ToolComponentMap } from "../graph-area-dsl";

export interface ToolsAreaProps {
    displayedTool?: string
    toolComponentMap: ToolComponentMap
    onToolPick: (tool: string) => void
}

export default function ToolsArea(props: ToolsAreaProps) {
    
    return <Panel 
        position="top-left"
        aria-label="Tools area"
    >
        <Card>
            <CardBody>
                <div className={cc(["flex flex-row-reverse", props.displayedTool ? "gap-4" : ""])}>
                    {Object.entries(props.toolComponentMap).map(([key, tool]) =>
                        <div className={key === props.displayedTool ? "block" : "hidden"} key={key}>
                            {tool.component}
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        { Object.entries(props.toolComponentMap).map(([toolName, tool]) => (
                            <div
                                key={toolName}
                                title={tool.title}
                                aria-label={tool.ariaLabel}
                                className="cursor-pointer"
                                onClick={() => props.onToolPick(toolName)}>
                                { tool.icon }
                            </div>
                        )) }
                    </div>
                </div>
            </CardBody>
        </Card>
    </Panel>
}