import { DagSpec, DataNodeSpec, ModuleNodeSpec } from "./dag-dsl"
import { DataTypes } from "./types-dsl"

const data1: DataNodeSpec = {
    tag: "data-node-spec-singleton",
    name: "Data 1",
    dtype: DataTypes.String
}
const data2: DataNodeSpec = {
    tag: "data-node-spec-product",
    name: "Data 2",
    dtype: {
        "a": DataTypes.String,
        "b": DataTypes.Integer
    }
}
const data3: DataNodeSpec = {
    tag: "data-node-spec-singleton",
    name: "Data 3",
    dtype: DataTypes.String
}
const data4: DataNodeSpec = {
    tag: "data-node-spec-singleton",
    name: "Data 4",
    dtype: DataTypes.String
}
const data5: DataNodeSpec = {
    tag: "data-node-spec-singleton",
    name: "Data 5",
    dtype: DataTypes.String
}

const module1: ModuleNodeSpec = {
    tag: "module-node-spec",
    name: "module1",
    in: [data1, data2],
    out: [data3]
}
const module2: ModuleNodeSpec = {
    tag: "module-node-spec",
    name: "module2",
    in: [data3],
    out: [data4]
}
const module3: ModuleNodeSpec = {
    tag: "module-node-spec",
    name: "module3",
    in: [data3],
    out: [data1]
}

export const StubModules = () => [module1, module2, module3]

export const StubDag: () => DagSpec = () => {

    const module1UUID = "module-1-fixed-uuid"
    const module2UUID = "module-2-fixed-uuid"
    const data1UUID = "data-1-fixed-uuid"
    const data2UUID = "data-2-fixed-uuid"
    const data3UUID = "data-3-fixed-uuid"
    const data4UUID = "data-4-fixed-uuid"
    const data5UUID = "data-5-fixed-uuid"

    return {
        tag: "dag-spec",
        name: "stub-dag",
        modules: {
            [module1UUID]: module1,
            [module2UUID]: module2
        },
        data: {
            [data1UUID]: data1,
            [data2UUID]: data2,
            [data3UUID]: data3,
            [data4UUID]: data4,
            [data5UUID]: data5
        },
        inEdges: [
            [data1UUID, module1UUID],
            [data2UUID, module1UUID],
            [data3UUID, module2UUID],
            [data5UUID, module1UUID],
            [data5UUID, module2UUID],
        ],
        outEdges: [
            [module1UUID, data3UUID],
            [module2UUID, data4UUID],
        ]
    }
}