import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import cn from 'classnames'
import styles from './MultiValueListRecord.less'
import ActionLink from '@teslerComponents/ui/ActionLink/ActionLink'
import { MultivalueSingleValue, RecordSnapshotState } from '@tesler-ui/core'
import { DrillDownType } from '@tesler-ui/core'
import { store } from '@tesler-ui/core'
import { $do } from '@actions/types'

export interface MultiValueListRecordOwnProps {
    multivalueSingleValue: MultivalueSingleValue
    isFloat: boolean
}

export interface MultiValueListRecordProps extends MultiValueListRecordOwnProps {
    onDrillDown: (drillDownUrl: string, drillDownType: DrillDownType) => void
}

const MultiValueListRecord: FunctionComponent<MultiValueListRecordProps> = props => {
    const singleValue = props.multivalueSingleValue
    const handleDrillDown = () => {
        props.onDrillDown(singleValue.options.drillDown, singleValue.options.drillDownType)
    }

    const historyClass =
        (singleValue.options.snapshotState &&
            cn({
                [styles.deletedValue]: singleValue.options.snapshotState === RecordSnapshotState.deleted,
                [styles.newValue]: singleValue.options.snapshotState === RecordSnapshotState.new
            })) ||
        null

    return (
        <div className={styles.fieldAreaFloat}>
            {singleValue.options?.hint && (
                <div>
                    <div className={cn(styles.hint, historyClass, { [styles.hintFloat]: props.isFloat })}>{singleValue.options.hint}</div>
                </div>
            )}
            <div className={historyClass}>
                <div className={styles.recordValue}>
                    {singleValue.options.drillDown ? (
                        <ActionLink onClick={handleDrillDown}>{singleValue.value}</ActionLink>
                    ) : (
                        singleValue.value
                    )}
                </div>
            </div>
        </div>
    )
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        onDrillDown: (drillDownUrl: string, drillDownType: DrillDownType) => {
            const route = store.getState().router
            dispatch(
                $do.drillDown({
                    url: drillDownUrl,
                    drillDownType: drillDownType,
                    route
                })
            )
        }
    }
}

/**
 * @category Components
 */
const ConnectedMultiValueListRecord = connect(null, mapDispatchToProps)(MultiValueListRecord)

export default ConnectedMultiValueListRecord
