export const createKeyMirror = <T extends string>(keys: readonly T[]) => {
    return Object.fromEntries(keys.map(key => [key, key])) as KeyMirror<T>
}
