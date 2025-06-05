import { DagSpec, RuntimeState, ComponentMetadata, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Accordion, AccordionItem, Chip, Code, Divider, ScrollShadow } from "@heroui/react"
import { BadgeCheck, Bomb, ClockAlert, Component, FileText, Telescope } from "lucide-react"
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import cc from "classcat";

export function ModuleIcon({ status }: { status?: ModuleStatus }) {
    switch (status?.tag) {
        case "Fired":
            return <BadgeCheck size="18" className="text-success-500" />
        case "Failed":
            return <Bomb size="18" className="text-danger-500" />
        case "Timed":
            return <ClockAlert size="18" className="text-warning-500" />
        case "Unfired":
            return <Component size="18" className="text-default-500" />
        default:
            return <Component size="18" className="text-default-500" />
    }
}

function borderClass(status?: ModuleStatus) {
    switch (status?.tag) {
        case "Fired":
            return "border-success-200";
        case "Failed":
            return "border-danger-200";
        case "Timed":
            return "border-warning-200";
        default:
            return "border-secondary-300";
    }
}

function Status({ status }: { status: ModuleStatus }) {
    if (status.tag === "Fired")
        return <Code color="success">Fired: {status.latency}ms</Code>
    else if (status.tag === "Failed")
        return <Code color="danger" className="max-w-lg text-wrap">Failed: {status.error}</Code>
    else if (status.tag === "Timed")
        return <Code color="warning">Timed: {status.latency}ms</Code>
    else
        return <Code color="default">Unfired</Code>
}

type KomodoModuleMetadata = {
    tag: "komodo-model"
    batchSize: number
    featureLoggingEnabled: boolean
    providedFeatures: string[]
    retrievalFeatures: string[]
}

function KomodoModuleContextView({ metadata, context }: { metadata?: ComponentMetadata, context?: KomodoModuleMetadata }) {
    if (!context || context.tag !== "komodo-model") return null

    return <div className="mt-3">
        <Accordion variant="splitted">
            <AccordionItem key="1" aria-label="Model Metadata" title="Model Metadata" startContent={<FileText />}>
            
                <ScrollShadow style={{ maxHeight: '500px' }}>
                    <JsonView src={context} />
                </ScrollShadow>
            </AccordionItem>
        </Accordion>
    </div>
}

type KomodoStatusContext = {
    tag: "komodo-model"
    sharedFeatures: Record<string, any>
    retrievalFeatures: Record<string, any>
}

function KomodoStatusContextView({ status }: { status?: ModuleStatus<KomodoStatusContext> }) {
    if (status?.tag !== "Fired" || !status.context || status.context.tag !== "komodo-model") return null
    return <div className="mt-3">
        <Accordion variant="splitted">
            <AccordionItem key="1" aria-label="Features" title="Features" startContent={<Telescope />}>
                <ScrollShadow style={{ maxHeight: '500px' }}>
                    <JsonView src={status.context} />
                </ScrollShadow>
            </AccordionItem>
        </Accordion>
    </div>
}

export interface NodeCardModuleProps {
    dag: DagSpec
    spec: ModuleNodeSpec
    context?: RuntimeState
    status?: ModuleStatus
    isSelected?: boolean
}

export default function NodeCardModule({ dag, spec, context, status, isSelected }: NodeCardModuleProps) {
    const borderType = isSelected ? "outline-double outline-3 outline-offset-2" : "outline-solid"
    return <Card shadow="md" className={cc([borderClass(status), borderType, "border-1"])}>
        <CardHeader>
            <div className="flex flex-row gap-2 items-center">
                <ModuleIcon status={status} />
                <div className="flex flex-row gap-1">
                    <p className="text-lg font-bold">{spec.metadata.name}</p>
                    <small className="block text-default-500">v{spec.metadata.majorVersion}.{spec.metadata.minorVersion}</small>
                </div>
            </div>
        </CardHeader>
        <Divider />
        <CardBody>
            <div className="flex flex-row gap-1">
                {spec.metadata.tags.map((tag, index) => (
                    <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="default"
                        className="text-sm text-default-500"
                    >
                        {tag}
                    </Chip>
                ))}
            </div>
            { (context && status) && <>
                <p className="text-sm text-default-500 mt-3 mb-1">Status</p>
                <Status status={status} />
            </>}
            <p className="text-sm text-default-500 mt-3 mb-1">Description</p>
            <p className="text-md text-default-600 max-w-lg text-wrap">{spec.metadata.description}</p>
            <KomodoModuleContextView metadata={spec.metadata} context={spec.definitionContext} />
            { (context && status) && <KomodoStatusContextView status={status} />}
        </CardBody>
    </Card>
}
