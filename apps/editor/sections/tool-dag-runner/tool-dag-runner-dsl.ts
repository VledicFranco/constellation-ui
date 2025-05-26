import { CType, CValue, cValueBoolean, cValueFloat, cValueInt, cValueListOf, cValueMapOf, cValueString } from "@/apps/common/dag-dsl";

export function cTypeDefaultValue(cType: CType): CValue {
    switch(cType.tag) {
        case "string":
            return cValueString("");
        case "integer":
            return cValueInt(0);
        case "boolean":
            return cValueBoolean(false);
        case "float":
            return cValueFloat(0.0);
        case "list":
            return cValueListOf([], cType.valuesType);
        case "map":
            return cValueMapOf([], cType.keysType, cType.valuesType);
        default:
            throw new Error(`Unsupported CType`);
    }
}