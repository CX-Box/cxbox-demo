declare module '*.less' {
    const classes: { readonly [key: string]: string }
    export default classes
}

declare type ValueOf<T> = T[keyof T]

declare type KeysMatching<T, V> = ValueOf<{
    [K in keyof T]: T[K] extends V ? K : never
}>

declare type KeyMirror<Keys> = { [K in Keys]: K }

declare type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>
