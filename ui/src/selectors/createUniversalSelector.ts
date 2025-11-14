import { isStateObject } from '@store'

/**
 * Creates a generic selector that can be called in two ways:
 * 1. selector(state, ...args)
 * 2. selector(...args)(state)
 *
 * @param baseSelector - A basic selector function that always takes 'state' as the first argument.
 * @template S - The type of state (for example, RootState).
 * @template A - The types of the remaining arguments of the selector are in the form of a tuple.
 * @template R - Selector return type.
 */
export function createUniversalSelector<S, A extends any[], R>(
    baseSelector: (state: S, ...args: A) => R
): {
    (...args: A): (state: S) => R
    (state: S, ...args: A): R
} {
    const universalSelector = (firstArg: S | A[0], ...restArgs: any[]) => {
        // Check if the first argument is a state object
        if (isStateObject(firstArg)) {
            const state = firstArg as S
            const args = restArgs as A
            return baseSelector(state, ...args)
        } else {
            const args = [firstArg, ...restArgs] as A

            return (state: S) => baseSelector(state, ...args)
        }
    }

    return universalSelector as unknown as {
        (...args: A): (state: S) => R
        (state: S, ...args: A): R
    }
}
