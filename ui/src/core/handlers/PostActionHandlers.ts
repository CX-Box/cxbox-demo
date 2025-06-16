import { UnionState } from '../data/slices'
import { Store } from '../data/Store.ts'
import get from 'lodash.get'
import { Navigation } from '../data/Navigation.ts'
import {
    ActionPostInvoke,
    isActionPostInvokeDownloadFile,
    isActionPostInvokeDownloadFileByUrl,
    isActionPostInvokeDrillDown,
    isActionPostInvokeOpenPickList,
    isActionPostInvokeRefreshBc,
    isActionPostInvokeShowMessage
} from '../contract/postActions'

export class PostActionHandlers<S extends UnionState> {
    constructor(
        protected store: Omit<Store<S>, 'useStore'>,
        protected navigation: Navigation
    ) {
        this.getPostAction = this.getPostAction.bind(this)
        this.drillDown = this.drillDown.bind(this)
        this.openPickList = this.openPickList.bind(this)
        this.showMessage = this.showMessage.bind(this)
        this.refreshBc = this.refreshBc.bind(this)
    }

    getPostAction(type: string) {
        return get(this, type, this.empty)
    }

    refreshBc(postAction: ActionPostInvoke) {
        if (isActionPostInvokeRefreshBc(postAction)) {
            /**
             * TODO: refresh bc post action
             */
        }
    }

    drillDown(postAction: ActionPostInvoke) {
        if (isActionPostInvokeDrillDown(postAction)) {
            if (postAction.drillDownType === 'inner') {
                if (postAction.url.startsWith('/')) {
                    this.navigation.navigate(postAction.url)
                } else {
                    this.navigation.navigate(`/${postAction.url}`)
                }
            }
        }
    }

    openPickList(postAction: ActionPostInvoke) {
        if (isActionPostInvokeOpenPickList(postAction)) {
            /**
             * TODO: open pick list post action
             */
        }
    }

    showMessage(postAction: ActionPostInvoke) {
        if (isActionPostInvokeShowMessage(postAction)) {
            /**
             * TODO: show message post action
             */
        }
    }

    downloadFile(postAction: ActionPostInvoke) {
        if (isActionPostInvokeDownloadFile(postAction)) {
            /**
             * TODO: download file post action
             */
        }
    }

    downloadFileByUrl(postAction: ActionPostInvoke) {
        if (isActionPostInvokeDownloadFileByUrl(postAction)) {
            /**
             * TODO: download file by url post action
             */
        }
    }

    empty(postAction: ActionPostInvoke) {
        console.log(postAction.type)
    }
}
