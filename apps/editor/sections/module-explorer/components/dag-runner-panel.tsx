import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Button,
    Form,
    Input,
    NumberInput,
    Checkbox,
    DateInput
} from "@heroui/react";
import { Panel } from "@xyflow/react";
import { CSSProperties, useState } from "react";

import { GraphAreaApi } from "../../graph-area";
import { isBoolean, isNumber, isTimestamp } from "@/apps/common/types-dsl";
import { isSingletonNode } from "@/apps/common/dag-dsl";

export default function DagRunnerPanel() {

    const runDag = () => {
    }

    const dataInputs = Object.entries(GraphAreaApi.getDagInputs());
    console.log("Data inputs: ", dataInputs);

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
                        DAG Inputs
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <Form
                            className="w-full justify-center items-center space-y-4"
                            onSubmit={(data) => console.log("Form submitted with data: ", data)}>
                            <div className="flex flex-col gap-4 w-full">
                                {dataInputs.map(([uuid, dataNodeSpec]) => {
                                    if (isSingletonNode(dataNodeSpec)) {
                                        if (isNumber(dataNodeSpec.dtype.raw)) {
                                            return (
                                                <NumberInput
                                                    size="sm"
                                                    hideStepper
                                                    key={uuid}
                                                    id={uuid}
                                                    label={dataNodeSpec.name}
                                                />
                                            );
                                        } else if (isBoolean(dataNodeSpec.dtype.raw)) {
                                            return (
                                                <Checkbox
                                                    size="sm"
                                                    key={uuid}
                                                    id={uuid}
                                                >{dataNodeSpec.name}</Checkbox>
                                            );
                                        } else if (isTimestamp(dataNodeSpec.dtype.raw)) {
                                            return (
                                                <DateInput
                                                    key={uuid}
                                                    id={uuid}
                                                    size="sm"
                                                    granularity="second"
                                                    label={dataNodeSpec.name} />
                                            );
                                        } else {
                                            return (
                                                <Input
                                                    key={uuid}
                                                    id={uuid}
                                                    size="sm"
                                                    label={dataNodeSpec.name} />
                                            );
                                        }
                                    }
                                })}
                            </div>
                        </Form>
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

