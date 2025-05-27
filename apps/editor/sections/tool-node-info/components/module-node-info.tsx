import { DagSpec, EngineContext, ModuleMetadata, ModuleNodeSpec, ModuleStatus } from "@/apps/common/dag-dsl"
import { Card, CardBody, CardHeader } from "@heroui/card"
import { Accordion, AccordionItem, Chip, Code, Divider, ScrollShadow } from "@heroui/react"
import { BadgeCheck, Bomb, ClockAlert, Component, FileText, Telescope } from "lucide-react"
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';

export function ModuleIcon({ status }: { status?: ModuleStatus }) {
    switch (status?.tag) {
        case "fired":
            return <BadgeCheck size="18" className="text-success-500" />
        case "failed":
            return <Bomb size="18" className="text-danger-500" />
        case "timed":
            return <ClockAlert size="18" className="text-warning-500" />
        case "unfired":
            return <Component size="18" className="text-default-500" />
        default:
            return <Component size="18" className="text-default-500" />
    }
}

function Status({ status }: { status: ModuleStatus }) {
    if (status.tag === "fired")
        return <Code color="success">Fired: {status.latency}ms</Code>
    else if (status.tag === "failed")
        return <Code color="danger" className="max-w-lg text-wrap">Failed: {status.error}</Code>
    else if (status.tag === "timed")
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

function KomodoModuleContextView({ metadata }: { metadata?: ModuleMetadata<KomodoModuleMetadata> }) {
    if (!metadata?.context || metadata.context.tag !== "komodo-model") return null

    return <div className="mt-3">
        <Accordion variant="splitted">
            <AccordionItem key="1" aria-label="Model Metadata" title="Model Metadata" startContent={<FileText />}>
            
                <ScrollShadow style={{ maxHeight: '500px' }}>
                    <JsonView src={metadata.context} />
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
    if (status?.tag !== "fired" || !status.context || status.context.tag !== "komodo-model") return null
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

interface DataNodeInfoProps {
    dag: DagSpec
    spec: ModuleNodeSpec
    context?: EngineContext
    status?: ModuleStatus
}

export default function ModuleNodeInfoView({ dag, spec, context, status }: DataNodeInfoProps) {
    return <Card>
        <CardHeader>
            <div className="flex flex-row gap-2 items-center">
                <ModuleIcon status={status} />
                <div className="flex flex-row gap-1">
                    <p className="text-lg font-bold">{spec.name}</p>
                    <small className="block text-default-500">v{spec.metadata.version}</small>
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
            <KomodoModuleContextView metadata={spec.metadata} />
            { (context && status) && <KomodoStatusContextView status={status} />}
        </CardBody>
    </Card>
}