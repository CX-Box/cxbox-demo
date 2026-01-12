import { hasOwn } from '@utils/object'

type EnumLikeInput = readonly string[] | Readonly<Record<string, string | number>>

type ObjectMergePrettify<T> = { [K in keyof T]: T[K] } & {}
type EnumLikeObjectMerge<A, B> = ObjectMergePrettify<Omit<A, keyof B> & B>

export class EnumLike {
    static concat<const A extends readonly string[], const B extends readonly string[]>(a: A, b: B): readonly [...A, ...B]
    static concat<const A extends Readonly<Record<string, string | number>>, const B extends Readonly<Record<string, string | number>>>(
        a: A,
        b: B
    ): Readonly<EnumLikeObjectMerge<A, B>>
    static concat(a: EnumLikeInput, b: EnumLikeInput) {
        if (Array.isArray(a) && Array.isArray(b)) {
            return Object.freeze([...a, ...b])
        }

        if (!Array.isArray(a) && !Array.isArray(b)) {
            return Object.freeze({ ...a, ...b })
        }

        throw new Error('[EnumLike.concat] Cannot concat array with object. Both arguments must be arrays or both must be objects.')
    }

    static create<const T extends readonly string[]>(input: T): { readonly [K in T[number]]: K }
    static create<const T extends Readonly<Record<string, string | number>>>(input: T): Readonly<T>
    static create(input: EnumLikeInput) {
        const obj = Array.isArray(input) ? Object.fromEntries(input.map(key => [key, key])) : { ...input }
        return Object.freeze(obj)
    }

    static keys<const T extends readonly string[]>(input: T): T
    static keys<const T extends Readonly<Record<string, string | number>>>(input: T): readonly Extract<keyof T, string>[]
    static keys(input: EnumLikeInput) {
        if (Array.isArray(input)) {
            return input
        }
        return Object.keys(input)
    }

    static values<const T extends readonly string[]>(input: T): T
    static values<const T extends Readonly<Record<string, string | number>>>(input: T): readonly T[keyof T][]
    static values(input: EnumLikeInput) {
        if (Array.isArray(input)) {
            return input
        }
        return Object.values(input)
    }

    static has<const T extends readonly string[]>(input: T, value: unknown): value is T[number]
    static has<const T extends Readonly<Record<string, string | number>>>(input: T, value: unknown): value is T[keyof T]
    static has(input: EnumLikeInput, value: unknown) {
        if (Array.isArray(input)) {
            return (input as readonly unknown[]).includes(value)
        }

        return (Object.values(input) as readonly unknown[]).includes(value)
    }

    static hasKey<const T extends readonly string[]>(input: T, key: unknown): key is T[number]
    static hasKey<const T extends Readonly<Record<string, string | number>>>(input: T, key: unknown): key is Extract<keyof T, string>
    static hasKey(input: EnumLikeInput, key: unknown) {
        if (Array.isArray(input)) {
            return (input as readonly unknown[]).includes(key)
        }
        return typeof key === 'string' && hasOwn(input, key)
    }
}

export type EnumLikeValueOf<T extends EnumLikeInput> = T extends readonly string[] ? T[number] : T[keyof T]
export type EnumLikeKeyOf<T extends EnumLikeInput> = T extends readonly string[] ? T[number] : Extract<keyof T, string>
