/**
 * The guard of {@link RotationSafeUserManager}: a lock on every refresh token. The contract is {@link RefreshTokenLock}.
 * The default implementation is {@link browserRefreshTokenLock}: it uses IndexedDB inside.
 */

/**
 * A lock on every refresh token. Only the tab that locked a token can send it. All tabs of the browser share the locks.
 *
 * An implementation must keep two promises:
 *
 * - {@link RefreshTokenLock.tryLock} is atomic for all tabs: if several tabs lock the same token, only one gets true.
 * - A lock survives a page reload and a browser crash.
 */
export interface RefreshTokenLock {
    /** Returns true if the token was not locked. True only once per token. If the storage is not available, returns false */
    tryLock(token: string): Promise<boolean>

    /** Called when the provider does not rotate tokens: the same token can be sent next time */
    unlock(token: string): Promise<void>

    /**
     * Can the lock keep its promises in this browser? If not, do not use {@link RotationSafeUserManager}: create a plain
     * `UserManager` of oidc-client-ts. It has no guard, but it renews tokens, and that is better than never sending a
     * refresh token.
     */
    isAvailable(): Promise<boolean>
}

/** The warning in the browser console when the storage is not available. It is written together with the error */
const NOT_AVAILABLE = 'Token renewal: the refresh token lock is not available, so the refresh token is not sent'

/**
 * {@link RefreshTokenLock} for all tabs of one browser. Inside: IndexedDB database `oidc.refresh-token-locks`, store `locks`.
 * Key: the hash of a token, not the token. Value: the time when it was locked.
 *
 * IndexedDB keeps the promises of {@link RefreshTokenLock}, and localStorage cannot:
 *
 * - Adding a key is atomic: if several tabs add the same key, only one succeeds.
 * - A committed record survives F5 and a browser crash.
 *
 * **If the browser has no IndexedDB**, then {@link RefreshTokenLock.isAvailable} returns false: the application should
 * create a plain `UserManager`. If it does not, {@link RefreshTokenLock.tryLock} returns false, the refresh token is never
 * sent, and every renewal uses the SSO cookie.
 *
 * All browsers since 2016 have IndexedDB (Chrome, Edge, Firefox, Safari 10+). One exception: Firefox private mode before
 * version 115 (July 2023).
 */
export const browserRefreshTokenLock: RefreshTokenLock = {
    async tryLock(token) {
        try {
            const key = await hashOf(token)
            await writeToStore(store => {
                store.add({ at: Date.now() }, key) // fails if the key already exists: then the transaction is rolled back
                deleteOlderThanMonth(store)
            })
            return true
        } catch (error) {
            if ((error as DOMException | null)?.name !== 'ConstraintError') {
                console.warn(NOT_AVAILABLE, error)
            }
            return false
        }
    },

    async unlock(token) {
        try {
            const key = await hashOf(token)
            await writeToStore(store => store.delete(key))
        } catch {
            // nothing to do: the token stays locked and is not sent again
        }
    },

    async isAvailable() {
        try {
            const database = await openDatabase()
            database.close()
            return true
        } catch (error) {
            console.warn(NOT_AVAILABLE, error)
            return false
        }
    }
}

/** One transaction: open the database, write, wait for the commit, close */
async function writeToStore(write: (store: IDBObjectStore) => void): Promise<void> {
    const database = await openDatabase()
    try {
        // 'strict': after the commit the record is on the disk
        const transaction = database.transaction('locks', 'readwrite', { durability: 'strict' })
        write(transaction.objectStore('locks'))
        await committed(transaction)
    } finally {
        database.close()
    }
}

/** Rejects if IndexedDB is not available or does not open in 3 seconds */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('oidc.refresh-token-locks', 1)
        request.onupgradeneeded = () => request.result.createObjectStore('locks').createIndex('at', 'at')
        let tooLate = false
        request.onsuccess = () => (tooLate ? request.result.close() : resolve(request.result))
        request.onerror = () => reject(request.error)
        setTimeout(() => {
            tooLate = true
            reject(new Error('IndexedDB did not open'))
        }, 3000)
    })
}

/** Resolves when the transaction is COMMITTED: only a committed record survives F5. Rejects if the transaction is rolled back */
function committed(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onabort = () => reject(transaction.error)
    })
}

/** A refresh token does not live that long */
function deleteOlderThanMonth(store: IDBObjectStore) {
    const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const cursorRequest = store.index('at').openCursor(IDBKeyRange.upperBound(monthAgo))
    cursorRequest.onsuccess = () => {
        cursorRequest.result?.delete()
        cursorRequest.result?.continue()
    }
}

/** The store keeps hashes, not tokens. On plain http there is no `crypto.subtle`: then the token itself is the key */
async function hashOf(token: string) {
    if (!crypto.subtle) {
        return token
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
