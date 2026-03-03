export function getFieldValue(key: string, record: Record<string, any> | undefined) {
    if (Array.isArray(record?.[key])) {
        return Array.isArray(record?.[key]) ? (record?.[key] as { id: string }[]).map(item => item.id).join(';') : undefined
    }

    return record?.[key]
}
