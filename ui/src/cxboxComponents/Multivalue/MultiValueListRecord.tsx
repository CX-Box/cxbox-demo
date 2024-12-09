import React, { FunctionComponent } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import cn from 'classnames'
import styles from './MultiValueListRecord.less'
import DrillDown from '@components/ui/DrillDown/DrillDown'
import { actions, interfaces } from '@cxbox-ui/core'
import { store } from '@store'
import { RecordSnapshotState } from '@cxbox-ui/schema'

const { drillDown } = actions

export interface MultiValueListRecordOwnProps {
    multivalueSingleValue: interfaces.MultivalueSingleValue
    isFloat: boolean
}

export interface MultiValueListRecordProps extends MultiValueListRecordOwnProps {
    onDrillDown: (drillDownUrl: string, drillDownType: interfaces.DrillDownType) => void
}

const MultiValueListRecord: FunctionComponent<MultiValueListRecordProps> = props => {
    const singleValue = props.multivalueSingleValue
    const handleDrillDown = () => {
        props.onDrillDown(singleValue.options?.drillDown ?? '', singleValue.options?.drillDownType as interfaces.DrillDownType)
    }

    const historyClass =
        (singleValue.options?.snapshotState &&
            cn({
                [styles.deletedValue]: singleValue.options?.snapshotState === RecordSnapshotState.deleted,
                [styles.newValue]: singleValue.options?.snapshotState === RecordSnapshotState.new
            })) ||
        undefined

    return (
        <div className={styles.fieldAreaFloat}>
            {singleValue.options?.hint && (
                <div>
                    <div className={cn(styles.hint, historyClass, { [styles.hintFloat]: props.isFloat })}>{singleValue.options.hint}</div>
                </div>
            )}
            <div className={historyClass}>
                <div className={styles.recordValue}>
                    {singleValue.options?.drillDown ? (
                        <DrillDown
                            displayedValue={singleValue.value}
                            url={singleValue.options?.drillDown}
                            type={singleValue.options?.drillDownType}
                            onDrillDown={handleDrillDown}
                        />
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
        onDrillDown: (drillDownUrl: string, drillDownType: interfaces.DrillDownType) => {
            const route = store.getState().router
            dispatch(
                drillDown({
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
