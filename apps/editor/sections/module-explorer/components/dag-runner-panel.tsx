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
import { CSSProperties, useCallback } from "react";

import { GraphAreaApi } from "../../graph-area";
import { isBoolean, isNumber, isTimestamp } from "@/apps/common/types-dsl";
import { isSingletonNode } from "@/apps/common/dag-dsl";

const renderNumberInput = (uuid: string, name: string) => (
    <NumberInput
        name={uuid}
        key={uuid}
        id={uuid}
        label={name}
        hideStepper
        size="sm"
    />
);

const renderCheckbox = (uuid: string, name: string) => (
    <Checkbox
        name={uuid}
        key={uuid}
        id={uuid}
        size="sm"
    >{name}</Checkbox>
);

const renderDateInput = (uuid: string, name: string) => (
    <DateInput
        name={uuid}
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
        name={uuid}
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

const onSubmit = (e) => {
    e.preventDefault();
    const data: { [entry: string]: FormDataEntryValue } = Object.fromEntries(new FormData(e.currentTarget));
    const entries = Object.entries(data).map(([key, value]) => {
        return [key, value.toString()]
    })
    const dataEntries = Object.fromEntries(entries)
    console.log("Form data:", dataEntries)
    GraphAreaApi.runDagWithInputs(dataEntries)
};

export default function DagRunnerPanel() {

    const dataInputs = Object.entries(GraphAreaApi.getDagInputs());

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
                <Form
                    className="w-full justify-center items-center space-y-4"
                    onSubmit={onSubmit}>
                    <Card className="w-full">
                        <CardHeader className="flex gap-1">
                            DAG Inputs
                        </CardHeader>
                        <Divider />
                        <CardBody>

                            <div className="flex flex-col gap-4 w-full">
                                {dataInputs.map(([uuid, dataNodeSpec]) => {
                                    if (isSingletonNode(dataNodeSpec)) {
                                        if (isSingletonNode(dataNodeSpec)) {
                                            return renderSingletonNode(uuid, dataNodeSpec);
                                        }
                                    }
                                })}
                            </div>
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            <Button type="submit" color="success" variant="bordered">Run</Button>
                        </CardFooter>
                    </Card>
                </Form>
            </div>
        </Panel >
    );
}

