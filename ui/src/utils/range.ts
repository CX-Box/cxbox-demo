export const generateRange = (from: number, to: number) => {
    const rangeArray: number[] = []

    for (let i = from; i <= to; i++) {
        rangeArray.push(i)
    }

    return rangeArray
}
