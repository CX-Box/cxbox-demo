import { UnionState } from '../data/slices'
import { Store } from '../data/Store.ts'
import get from 'lodash.get'
import { ActionPreInvoke, isActionPreInvokeConfirm, isActionPreInvokeError, isActionPreInvokeInfo } from '../contract/preActions'

export class PreActionHandlers<S extends UnionState> {
    constructor(protected store: Omit<Store<S>, 'useStore'>) {
        this.getPreAction = this.getPreAction.bind(this)
        this.info = this.info.bind(this)
        this.confirm = this.confirm.bind(this)
        this.error = this.error.bind(this)
    }

    public getPreAction(type: string) {
        return get(this, type, this.empty)
    }

    protected error(preInvoke: ActionPreInvoke) {
        return new Promise((resolve, reject) => {
            if (isActionPreInvokeError(preInvoke)) {
                reject(preInvoke.message)
            }
            resolve(preInvoke)
        })
    }

    protected info(preInvoke: ActionPreInvoke) {
        return new Promise(resolve => {
            if (isActionPreInvokeInfo(preInvoke)) {
                resolve(preInvoke.message)
            }
        })
    }

    protected confirm(preInvoke: ActionPreInvoke) {
        const state = this.store.getState()
        return new Promise((resolve, reject) => {
            if (isActionPreInvokeConfirm(preInvoke)) {
                state.showNewModal({
                    id: 'confirm',
                    componentType: 'ConfirmModal',
                    resolve: resolve,
                    reject: reject,
                    props: {
                        children: preInvoke.message
                    }
                })
            }
        })
    }

    protected empty(preInvoke: ActionPreInvoke) {
        return new Promise((_, reject) => {
            reject(`${preInvoke.type} is not implemented`)
        })
    }
}
