import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Divider,
    Form,
    Input,
    NumberInput,
    ScrollShadow,
    Spinner
} from "@heroui/react";
import { FormEvent, useEffect } from "react";

import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

import { CValue, cValueInt, cValueString, DataNodeSpec } from "@/apps/common/dag-dsl";
import { GraphAreaApi } from "../graph-area";
import { ToolDagRunnerState, useToolDagRunnerState } from "./tool-dag-runner-state";

interface CInputProps {
    uuid: string
    spec: DataNodeSpec
    state: ToolDagRunnerState
}

function CInput({ uuid, spec, state }: CInputProps) {
    if (spec.cType.tag === "string")
        return <CStringInput
            uuid={uuid}
            name={spec.name}
            value={state.getValue(uuid)?.[1]}
            onValueChange={state.setValue}
        />;
    else if (spec.cType.tag === "integer")
        return <CNumberInput
            uuid={uuid}
            name={spec.name}
            value={state.getValue(uuid)?.[1]}
            onValueChange={state.setValue}
        />;
    else 
        return <></>
}

interface InputProps {
    uuid: string
    name: string
    value?: CValue
    onValueChange: (uuid: string, value: CValue) => void
}

function CStringInput({ uuid, name, value, onValueChange }: InputProps) {
    if (value?.tag !== "string")
        throw new Error(`Expected CValue to be of type 'string', but got ${value?.tag}`)
    return <Input
        key={uuid}
        name={uuid}
        size="sm"
        label={name}
        defaultValue={value?.value}
        onValueChange={(value) => onValueChange(uuid, cValueString(value))}
    />
}

function CNumberInput({ uuid, name, value, onValueChange }: InputProps) {
    if (value?.tag !== "integer")
        throw new Error(`Expected CValue to be of type 'integer' but got ${value?.tag}`)
    return <NumberInput
        key={uuid}
        name={uuid}
        size="sm"
        label={name}
        hideStepper
        formatOptions={{
            useGrouping: false,
        }}
        defaultValue={value.value}
        onValueChange={(value) => onValueChange(uuid, cValueInt(value))}
    />
}


export default function ToolDagRunnerView() {
    const state = useToolDagRunnerState();
    useEffect(() => {
        const dag = GraphAreaApi.getDag();
        state.setInputSpecs(dag);
        GraphAreaApi.onDagChange((dag) => {
            state.setInputSpecs(dag)
        })
    }, [])

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        state.runDag()
    }

    // Don't render if there are no data inputs
    if (state.specs.length === 0) {
        return <div><h2>DAG Runner</h2></div>
    }

    return <>
        <div className="flex flex-col gap-2">
            <Form
                className="w-full justify-center items-center space-y-4"
                onSubmit={onSubmit}
                onReset={() => GraphAreaApi.cleanEngineContext()}>
                <Card className="w-full">
                    <CardHeader className="flex gap-1">
                        DAG Inputs
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col gap-4 w-full">
                                {state.specs.map(([uuid, dataNodeSpec]) => {
                                    return <CInput
                                        key={uuid}
                                        uuid={uuid}
                                        spec={dataNodeSpec}
                                        state={state}
                                    />
                            })}
                            </div>
                            {state.engineContext && (
                                <div className="flex flex-col w-full">
                                    <Accordion variant="splitted">
                                        <AccordionItem key="1" aria-label="Raw response JSON" title="Raw response JSON">
                                            <ScrollShadow style={{ maxHeight: '500px' }}>
                                                <JsonView src={state.engineContext} />
                                            </ScrollShadow>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            )}
                        </div>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        {!state.isSubmitting ? (
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
    </>
}


