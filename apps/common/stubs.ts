import { v4 } from "uuid"
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

    const module1UUID = v4()
    const module2UUID = v4()
    const data1UUID = v4()
    const data2UUID = v4()
    const data3UUID = v4()
    const data4UUID = v4()

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
            [data4UUID]: data4
        },
        edges: [
            [data1UUID, module1UUID],
            [data2UUID, module1UUID],
            [module1UUID, data3UUID],
            [data3UUID, module2UUID],
            [module2UUID, data4UUID]
        ]
    }
}