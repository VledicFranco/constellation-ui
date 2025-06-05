import { CType, CValue, cValueBoolean, cValueFloat, cValueInt, cValueListOf, cValueMapOf, cValueString } from "@/apps/common/dag-dsl";

export function cTypeDefaultValue(cType: CType): CValue {
    switch(cType.tag) {
        case "CString":
            return cValueString("");
        case "CInt":
            return cValueInt(0);
        case "CBoolean":
            return cValueBoolean(false);
        case "CFloat":
            return cValueFloat(0.0);
        case "CList":
            return cValueListOf([], cType.valuesType);
        case "CMap":
            return cValueMapOf([], cType.keysType, cType.valuesType);
        default:
            throw new Error(`Unsupported CType: ${cType}`);
    }
}