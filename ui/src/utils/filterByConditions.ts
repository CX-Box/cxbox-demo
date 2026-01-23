/**
 * Splits the array into groups according to a list of conditions, applying them sequentially (by priority).
 *
 * Algorithm:
 * 1) For each element of the `arr` array, the conditions from `conditions` are checked from left to right.
 * 2) The element falls into the first group whose condition returned `true`.
 * 3) If none of the conditions work, the element falls into the last group.
 * @param arr
 * @param conditions
 */
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
