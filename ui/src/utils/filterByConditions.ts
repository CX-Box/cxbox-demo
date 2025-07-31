export function filterByConditions<T>(arr: T[], conditions: ((item: T, index: number) => boolean)[]): T[][] {
    const result: T[][] = Array(conditions.length + 1)
        .fill([])
        .map(() => [])

    arr.forEach((item: T, itemIndex) => {
        let matched = false

        for (let i = 0; i < conditions.length; i++) {
            if (conditions[i](item, itemIndex)) {
                result[i].push(item)
                matched = true
                break
            }
        }

        if (!matched) {
            result[result.length - 1].push(item)
        }
    })

    return result
}
