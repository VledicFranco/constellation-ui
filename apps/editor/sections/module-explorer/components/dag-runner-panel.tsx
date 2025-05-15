import { Key, useEffect } from "react"
import { useModuleExplorerState } from "../module-explorer-state"
import { Card, CardBody, CardFooter, CardHeader, Divider, Button } from "@heroui/react";
import { Panel } from "@xyflow/react";
import { CSSProperties, useState } from "react";
import { ExplorersModule } from "../module-explorer-dsl";
import { GraphAreaApi } from "../../graph-area";

export default function DagRunnerPanel() {

    const [selectedModule, setSelectedModule] = useState<ExplorersModule | null | undefined>(null);

    const runDag = () => {

    }

    return (
        <Panel
            id="explorer-panel"
            position="top-right"
            aria-label="Module Explorer"
            className="w-60"
            style={{
                'right': '50px',
                'width': '500px',
                'backgroundColor': 'rgba(255, 255, 255, 0.8)',
                'height': 'auto',
            } as CSSProperties}>
            <div className="flex flex-col gap-2">
                <Card className="max-w-full">
                    <CardHeader className="flex gap-1">
                        Card Header
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <p>Card Body</p>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <Button color="success" variant="bordered" onPress={runDag}>Run</Button>
                    </CardFooter>
                </Card>
            </div>
        </Panel>
    );
}

