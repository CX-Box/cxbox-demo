export const changeOrderWithMutate = <T>(array: T[], oldIndex: number, newIndex: number) => {
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])

    return array
}
