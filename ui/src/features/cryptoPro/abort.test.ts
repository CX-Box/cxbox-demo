import { describe, expect, it } from 'vitest'
import { throwIfAborted, untilAborted } from './abort'

const deferred = <T>() => {
    let resolve!: (value: T) => void
    let reject!: (error: unknown) => void
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })
    return { promise, resolve, reject }
}

describe('untilAborted', () => {
    it('returns the result as is without a signal or an abort', async () => {
        expect(await untilAborted(Promise.resolve('sig'))).toBe('sig')
        expect(await untilAborted(Promise.resolve('sig'), new AbortController().signal)).toBe('sig')
        await expect(untilAborted(Promise.reject(new Error('plugin')), new AbortController().signal)).rejects.toThrow('plugin')
    })

    it('stops waiting on abort: OPERATION_ABORTED, the late result and the late error are ignored', async () => {
        const controller = new AbortController()
        const call = deferred<string>()
        const waiting = untilAborted(call.promise, controller.signal)
        controller.abort()
        await expect(waiting).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
        call.resolve('late')

        const other = new AbortController()
        const failing = deferred<string>()
        const waitingForFailure = untilAborted(failing.promise, other.signal)
        other.abort()
        await expect(waitingForFailure).rejects.toEqual(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
        // no unhandled rejection: the late error is caught
        failing.reject(new Error('Lost connection to extension'))
        await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('an already aborted signal rejects at once', async () => {
        const controller = new AbortController()
        controller.abort()
        await expect(untilAborted(new Promise(() => undefined), controller.signal)).rejects.toEqual(
            expect.objectContaining({ code: 'OPERATION_ABORTED' })
        )
    })
})

describe('throwIfAborted', () => {
    it('throws OPERATION_ABORTED only after an abort', () => {
        const controller = new AbortController()
        expect(() => throwIfAborted(undefined)).not.toThrow()
        expect(() => throwIfAborted(controller.signal)).not.toThrow()
        controller.abort()
        expect(() => throwIfAborted(controller.signal)).toThrow(expect.objectContaining({ code: 'OPERATION_ABORTED' }))
    })
})
