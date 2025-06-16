/*
 * © OOO "SI IKS LAB", 2022-2023
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ApiDataResponse, DrillDownType } from './common'
import { ActionPostInvoke } from './postActions'
import { ActionPreInvoke } from './preActions'

/**
 * Possible types of fields values
 */
export type DataValue = string | number | boolean | null | MultivalueSingleValue[] | undefined | DataItem[]

/**
 * Instance of `Business component` data
 * Has unlimited number of fields, which available to widget
 */
export interface DataItem {
    /**
     * Record's identificator
     */
    id: string
    /**
     * Version of last record's edit
     */
    vstamp: number
    /**
     * User fields
     */
    [fieldName: string]: DataValue
}

/**
 * Structure which contain `Multivalue` fields's values
 */
export interface MultivalueSingleValue {
    /**
     * Record's identificator
     */
    id: string
    /**
     * Showed value
     */
    value: string
    options?: MultivalueSingleValueOptions
}

/**
 * `Multivalue` fields's options
 */
export interface MultivalueSingleValueOptions {
    /**
     * Hint for value
     */
    hint?: string
    /**
     * Type of Icon
     */
    icon?: string
    drillDown?: string
    drillDownType?: DrillDownType
    snapshotState?: RecordSnapshotState
    primary?: boolean | null
}

export interface AssociatedItem extends DataItem {
    _associate: boolean
}

export interface SuggestionPickListDataItem {
    value: string
    id: string
    [key: string]: unknown
}

export type RecordSnapshotState = 'noChange' | 'new' | 'deleted'

/**
 * API's response on Business Component's data.ts request
 */
export interface BcDataResponse extends ApiDataResponse {
    data: DataItem[]
    hasNext: boolean
}

/**
 * Result of saving record, which back-end returns
 */
export interface DataItemResponse extends ApiDataResponse {
    data: {
        /**
         * Saved record
         */
        record: DataItem
        /**
         * Actions which have to do after saving
         */
        postActions?: ActionPostInvoke[]
        /*
         * @deprecated TODO: Remove in 2.0.0 in favor of postInvokeConfirm (is this todo needed?)
         */
        preInvoke?: ActionPreInvoke
    }
}

export function isDataItemResponse(res: ApiDataResponse): res is DataItemResponse {
    return 'record' in res.data
}

export function isDataValueString(value: DataValue): value is string {
    return typeof value === 'string'
}

export function isDataValueNumber(value: DataValue): value is number {
    return typeof value === 'number'
}

export function isDataValueBoolean(value: DataValue): value is boolean {
    return typeof value === 'boolean'
}

export function isDataValueNull(value: DataValue): value is null {
    return value === null
}

export function isDataValueMultivalueSingleValue(value: DataValue): value is MultivalueSingleValue[] {
    return Array.isArray(value) && value.every(v => 'id' in v && 'value' in v)
}

export function isDataValueDataItem(value: DataValue): value is DataItem[] {
    return Array.isArray(value) && value.every(v => 'id' in v && 'vstamp' in v)
}
