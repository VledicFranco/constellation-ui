
export type Value = {
    dataType: DataType
    missingOrNull: Boolean
    longValue: number | null
    stringValue: String | null
    doubleValue: number | null
    boolValue: Boolean | null
    timestampValue: string | null
    listValue: Value[] | null
    timeseriesValue: null
    mappingValue: null
    embeddingValue: null
}

export type DataType = {
    raw: string
    subType: RawType | null
    context: string | null
    embeddingType: null
}

export type RawType = {
    raw: DataTypeLabel
    subType: RawType | null
    embeddingType: null
}

export type DataTypeLabel
    = "Unknown" | "BooleanValue" | "FloatNumeric" | "IntNumeric" | "StringValue"
    | "Timestamp" | "Mapping" | "ListValue" | "Timeseries" | "Embedding"

export const isNumber = (dataTypeLabel: string): boolean => {
    return dataTypeLabel === "FloatNumeric" || dataTypeLabel === "IntNumeric"
}

export const isBoolean = (dataTypeLabel: string): boolean => {
    return dataTypeLabel === "BooleanValue"
}

export const isTimestamp = (dataTypeLabel: string): boolean => {
    return dataTypeLabel === "Timestamp"
}

export const DataTypes = {

    Bool: ({
        raw: "BooleanValue",
        subType: null,
        context: null,
        embeddingType: null
    } as DataType),

    Float: ({
        raw: "FloatNumeric",
        subType: null,
        context: null,
        embeddingType: null
    } as DataType),

    Integer: ({
        raw: "IntNumeric",
        subType: null,
        context: null,
        embeddingType: null
    } as DataType),

    String: ({
        raw: "StringValue",
        subType: null,
        context: null,
        embeddingType: null
    } as DataType),

    Timestamp: ({
        raw: "Timestamp",
        subType: null,
        context: null,
        embeddingType: null
    } as DataType),

    List: (subType: DataType) => ({
        raw: "ListValue",
        subType: {
            raw: subType.raw,
            subType: subType.subType,
            embeddingType: subType.embeddingType,
        },
        context: "ListingId",
        embeddingType: null
    } as DataType),

    ListingId: ({
        raw: "IntNumeric",
        subType: null,
        context: "ListingId",
        embeddingType: null
    } as DataType),

    UserId: ({
        raw: "IntNumeric",
        subType: null,
        context: "UserId",
        embeddingType: null
    } as DataType),
}

export const Bool = (value: boolean): Value => ({
    dataType: DataTypes.Bool,
    missingOrNull: false,
    longValue: null,
    stringValue: null,
    doubleValue: null,
    boolValue: value,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const Float = (value: number): Value => ({
    dataType: DataTypes.Float,
    missingOrNull: false,
    longValue: null,
    stringValue: null,
    doubleValue: value,
    boolValue: null,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const Integer = (value: number): Value => ({
    dataType: DataTypes.Integer,
    missingOrNull: false,
    longValue: value,
    stringValue: null,
    doubleValue: null,
    boolValue: null,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const String = (value: string): Value => ({
    dataType: DataTypes.String,
    missingOrNull: false,
    longValue: null,
    stringValue: value,
    doubleValue: null,
    boolValue: null,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const Timestamp = (value: string): Value => ({
    dataType: DataTypes.Timestamp,
    missingOrNull: false,
    longValue: null,
    stringValue: null,
    doubleValue: null,
    boolValue: null,
    timestampValue: value,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const List = (value: Value[]): Value => ({
    dataType: DataTypes.List(DataTypes.String),
    missingOrNull: false,
    longValue: null,
    stringValue: null,
    doubleValue: null,
    boolValue: null,
    timestampValue: null,
    listValue: value,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const ListingId = (value: number): Value => ({
    dataType: DataTypes.ListingId,
    missingOrNull: false,
    longValue: value,
    stringValue: null,
    doubleValue: null,
    boolValue: null,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const UserId = (value: number): Value => ({
    dataType: DataTypes.UserId,
    missingOrNull: false,
    longValue: value,
    stringValue: null,
    doubleValue: null,
    boolValue: null,
    timestampValue: null,
    listValue: null,
    timeseriesValue: null,
    mappingValue: null,
    embeddingValue: null,
}) as Value

export const buildValue = (value: string, dataType: DataType): Value => {
    if (value === null || value === undefined) {
        return ({
            dataType: dataType,
            missingOrNull: true,
            longValue: null,
            stringValue: null,
            doubleValue: null,
            boolValue: null,
            timestampValue: null,
            listValue: null,
            timeseriesValue: null,
            mappingValue: null,
            embeddingValue: null
        } as Value)
    }
    else if (dataType.context) {
        if (dataType.context === "ListingId") {
            return ListingId(Number.parseInt(value))
        }
        else if (dataType.context === "UserId") {
            return UserId(Number.parseInt(value))
        }
        else {
            throw new Error(`Unsupported context ${dataType.context}`)
        }
    } else 
        switch (dataType.raw) {
            case "BooleanValue":
                return Bool(true)
            case "FloatNumeric":
                return Float(Number.parseFloat(value))
            case "IntNumeric":
                return Integer(Number.parseInt(value))
            case "StringValue":
                return String(value)
            case "Timestamp":
                return Timestamp(value)
            default:
                throw new Error(`Unsupported data type ${dataType.raw}`)
        }
}
