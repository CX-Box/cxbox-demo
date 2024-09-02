// function to build keys array
import { BcMeta } from '@cxbox-ui/core'

export const buildBcKey = (bcs: BcMeta[], lastCursor?: string) => {
    //collect all keys without last cursor
    const bcKeys = bcs?.reduce<(string | null)[]>((acc, bc, index) => {
        if (index !== bcs.length - 1) {
            acc.push(bc.name, bc.cursor)
        } else {
            acc.push(bc.name)
            if (lastCursor) {
                acc.push(lastCursor)
            }
        }
        return acc
    }, [])
    //check keys for nullish or empty cursors to disable wrong keys query
    if (bcKeys.every(key => !!key)) {
        return bcKeys
    }

    return []
}
