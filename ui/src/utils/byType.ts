export function byType<T extends { type: string }, K extends T['type']>(
    expectedType: K | K[]
): (item: T) => item is Extract<T, { type: K }> {
    return (item: T): item is Extract<T, { type: K }> => {
        if (Array.isArray(expectedType)) {
            return expectedType.includes(item.type as K)
        }
        return item.type === expectedType
    }
}
