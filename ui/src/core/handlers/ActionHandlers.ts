import { Store } from '../data/Store.ts'
import { Api } from '../data/Api.ts'
import { UnionState } from '../data/slices'
import camelCase from 'lodash.camelcase'
import { QueryClient } from '@tanstack/react-query'
import {
    Action,
    isActionAssociate,
    isActionCancelCreate,
    isActionCreate,
    isActionDelete,
    isActionFileUpload,
    isActionSave
} from '../contract/actions'
import { ApiResponse } from '../contract/common'
import get from 'lodash.get'

export interface AnyActionParams {
    action: Action
    screenName: string
    bcName: string
    bcPath: string | null
    cursor: string | null
}

export class ActionHandlers<S extends UnionState> {
    constructor(
        protected api: Api,
        protected store: Omit<Store<S>, 'useStore'>,
        protected queryClient: QueryClient
    ) {
        this.getAction = this.getAction.bind(this)
        this.create = this.create.bind(this)
        this.save = this.save.bind(this)
        this.delete = this.delete.bind(this)
        this.associate = this.associate.bind(this)
        this.cancelCreate = this.cancelCreate.bind(this)
        this.fileUpload = this.fileUpload.bind(this)
        this.customAction = this.customAction.bind(this)
    }

    getAction(type: string) {
        return get(this, camelCase(type), this.customAction) as (params: AnyActionParams) => Promise<ApiResponse>
    }

    protected async create(params: AnyActionParams) {
        if (isActionCreate(params.action)) {
            /**
             * TODO: create action
             */
        }
    }

    protected async save(params: AnyActionParams) {
        if (isActionSave(params.action)) {
            /**
             * TODO: save action
             */
        }
    }

    protected async delete(params: AnyActionParams) {
        if (isActionDelete(params.action)) {
            /**
             * TODO: delete action
             */
        }
    }

    protected async associate(params: AnyActionParams) {
        if (isActionAssociate(params.action)) {
            /**
             * TODO: associate action
             */
        }
    }

    protected async cancelCreate(params: AnyActionParams) {
        if (isActionCancelCreate(params.action)) {
            /**
             * TODO: cancel-create action
             */
        }
    }

    protected async fileUpload(params: AnyActionParams) {
        if (isActionFileUpload(params.action)) {
            /**
             * TODO: file upload action
             */
        }
    }

    protected async customAction(params: AnyActionParams) {
        /**
         * TODO: implement default action
         */
        console.log(params.action.type)
    }
}
