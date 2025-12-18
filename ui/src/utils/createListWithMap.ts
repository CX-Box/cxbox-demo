import { createKeyMirror } from '@utils/createKeyMirror'

// ['A', 'B'] -> [['A', 'B'], { A: 'A', B: 'B' }]
export function createListWithMap<const T extends readonly string[]>(keysOrMap: T): readonly [T, { [K in T[number]]: K }]
// { key: 'value' } -> [['value'], { key: 'value' }]
export function createListWithMap<T extends Record<string, string>>(keysOrMap: T): readonly [readonly T[keyof T][], T]
export function createListWithMap(keysOrMap: readonly string[] | Record<string, string>) {
    if (Array.isArray(keysOrMap)) {
        return [keysOrMap, createKeyMirror(keysOrMap)] as const
    }

    return [Object.values(keysOrMap), keysOrMap] as const
}
