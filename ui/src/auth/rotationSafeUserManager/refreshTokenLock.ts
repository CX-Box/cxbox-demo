/**
 * Only the tab that locked a refresh token sends it. An implementation must follow two rules:
 *
 * - {@link RefreshTokenLock.tryLock} is atomic for all tabs: if several tabs lock the same token, only one gets true.
 * - A lock survives a page reload and a browser crash.
 */
export interface RefreshTokenLock {
    /**
     * True only once per token. If the storage does not work, false: better not to send a token than to send it twice
     */
    tryLock(token: string): Promise<boolean>

    /** Called when the provider does not rotate tokens: the same token can be sent next time */
    unlock(token: string): Promise<void>

    /**
     * If false, create a plain `UserManager` instead of `RotationSafeUserManager`:
     * without the lock it would never send a refresh token
     */
    isAvailable(): Promise<boolean>
}

const NOT_AVAILABLE = 'Token renewal: the refresh token lock is not available, so the refresh token is not sent'

/**
 * IndexedDB, not localStorage: adding a key there is atomic for all tabs, and a committed record survives F5
 * and a browser crash
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

/** Only a committed record survives F5, so a lock counts only after `oncomplete` */
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

/**
 * The store keeps hashes, not the tokens themselves. Plain http has no `crypto.subtle`: then the key is the token
 */
async function hashOf(token: string) {
    if (!crypto.subtle) {
        return token
    }
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
