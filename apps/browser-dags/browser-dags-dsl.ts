import { DagMetadata } from "../common/dag-dsl";

export type CreateDagResponse 
    = { tag: "created", metadata: DagMetadata }
    | { tag: "exists", message: string };
