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

const renderNumberInput = (uuid: string, name: string) => (
    <NumberInput
        size="sm"
        hideStepper
        key={uuid}
        id={uuid}
        label={name}
    />
);

const renderCheckbox = (uuid: string, name: string) => (
    <Checkbox
        size="sm"
        key={uuid}
        id={uuid}
    >{name}</Checkbox>
);

const renderDateInput = (uuid: string, name: string) => (
    <DateInput
        key={uuid}
        id={uuid}
        size="sm"
        granularity="second"
        label={name}
    />
);

const renderDefaultInput = (uuid: string, name: string) => (
    <Input
        key={uuid}
        id={uuid}
        size="sm"
        label={name}
    />
);

const renderSingletonNode = (uuid: string, dataNodeSpec: any) => {
    if (isNumber(dataNodeSpec.dtype.raw)) {
        return renderNumberInput(uuid, dataNodeSpec.name);
    } else if (isBoolean(dataNodeSpec.dtype.raw)) {
        return renderCheckbox(uuid, dataNodeSpec.name);
    } else if (isTimestamp(dataNodeSpec.dtype.raw)) {
        return renderDateInput(uuid, dataNodeSpec.name);
    } else {
        return renderDefaultInput(uuid, dataNodeSpec.name);
    }
}

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
                                        if (isSingletonNode(dataNodeSpec)) {
                                            return renderSingletonNode(uuid, dataNodeSpec);
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

