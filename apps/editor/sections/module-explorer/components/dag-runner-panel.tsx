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
    DateInput,
    Spinner,
    Accordion,
    AccordionItem,
    ScrollShadow
} from "@heroui/react";
import { Panel } from "@xyflow/react";
import { CSSProperties, useState } from "react";

import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'

import { GraphAreaApi } from "../../graph-area";
import { isBoolean, isNumber, isTimestamp } from "@/apps/common/types-dsl";
import { isSingletonNode } from "@/apps/common/dag-dsl";
import { useModuleExplorerState } from "../module-explorer-state";

const renderNumberInput = (uuid: string, name: string, getDefaultValue: (uuid: string) => any) => (
    <NumberInput
        name={uuid}
        key={uuid}
        id={uuid}
        label={name}
        hideStepper
        formatOptions={{
            useGrouping: false,
        }}
        defaultValue={getDefaultValue(uuid)}
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

const renderDefaultInput = (uuid: string, name: string, getDefaultValue: (uuid: string) => any) => (
    <Input
        key={uuid}
        name={uuid}
        id={uuid}
        size="sm"
        label={name}
        defaultValue={getDefaultValue(uuid)}
    />
);



export default function DagRunnerPanel() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedSuccessfully, setSubmittedSuccessfully] = useState(null);
    const { getRunnerPanelValue, setDagRunnerPanelValue, resetDagRunnerPanelValues } = useModuleExplorerState();

    const handleInputChange = (uuid: string, value: string) => {
        setDagRunnerPanelValue(uuid, value);
    };

    const renderSingletonNode = (uuid: string, dataNodeSpec: any) => {
        if (isNumber(dataNodeSpec.dtype.raw)) {
            return renderNumberInput(uuid, dataNodeSpec.name);
        } else if (isBoolean(dataNodeSpec.dtype.raw)) {
            return renderCheckbox(uuid, dataNodeSpec.name);
        } else if (isTimestamp(dataNodeSpec.dtype.raw)) {
            return renderDateInput(uuid, dataNodeSpec.name);
        } else {
            return renderDefaultInput(uuid, dataNodeSpec.name, getRunnerPanelValue);
        }
    }

    const handleReset = () => {
        resetDagRunnerPanelValues();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const data: { [entry: string]: FormDataEntryValue } = Object.fromEntries(new FormData(e.currentTarget));
        const entries = Object.entries(data).map(([key, value]) => {
            return [key, value.toString()]
        })
        const dataEntries = Object.fromEntries(entries)
        GraphAreaApi.runDagWithInputs(dataEntries)
            .then((context) => {
                entries.forEach(([key, value]) => handleInputChange(key, value));
                setIsSubmitting(false);
                setSubmittedSuccessfully(context);
            })
            .catch((error) => {
                console.error("Error running DAG:", error);
                setIsSubmitting(false);
            });
    };

    const dataInputs = Object.entries(GraphAreaApi.getDagInputs() || {});

    // Don't render if there are no data inputs
    if (!dataInputs || dataInputs.length === 0) {
        return null;
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
                <Form
                    className="w-full justify-center items-center space-y-4"
                    onSubmit={onSubmit}
                    onReset={handleReset}>
                    <Card className="w-full">
                        <CardHeader className="flex gap-1">
                            DAG Inputs
                        </CardHeader>
                        <Divider />
                        <CardBody>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-4 w-full">
                                    {dataInputs.map(([uuid, dataNodeSpec]) => {
                                        if (isSingletonNode(dataNodeSpec)) {
                                            return renderSingletonNode(uuid, dataNodeSpec);
                                        }
                                        return null;
                                    })}
                                </div>
                                {submittedSuccessfully && (
                                    <div className="flex flex-col w-full">
                                        <Accordion variant="splitted">
                                            <AccordionItem key="1" aria-label="Raw response JSON" title="Raw response JSON">
                                                <ScrollShadow style={{ maxHeight: '300px' }}>
                                                    <JsonView src={submittedSuccessfully} />
                                                </ScrollShadow>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                        <Divider />
                        <CardFooter>
                            {!isSubmitting ? (
                                <div className="flex gap-4">
                                    <Button type="submit" color="primary" variant="bordered">Run</Button>
                                    <Button type="reset" variant="bordered">Reset</Button>
                                </div>
                            ) : (
                                <div className="flex flex-row gap-2 w-full justify-center">
                                    <Spinner size="lg" />
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </Form>
            </div>
        </Panel>
    );
}

