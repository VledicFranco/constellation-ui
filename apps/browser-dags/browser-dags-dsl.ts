import { ComponentMetadata } from "../common/dag-dsl";

export type CreateDagResponse 
    = { tag: "created", metadata: ComponentMetadata }
    | { tag: "exists", message: string };
