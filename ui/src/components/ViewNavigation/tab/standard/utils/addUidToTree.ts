import { nanoid } from '@reduxjs/toolkit'

export interface NodeWithUid {
    uid: string | undefined
    child?: NodeWithUid[]
}

export function addUidToTree(node: NodeWithUid) {
    if (typeof node === 'object' && node !== null) {
        node.uid = nanoid()
    }

    node.child?.forEach(child => {
        addUidToTree(child)
    })
}
