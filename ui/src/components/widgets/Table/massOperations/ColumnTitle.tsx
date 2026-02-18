import React, { FormEvent, useCallback, useEffect } from 'react'
import cn from 'classnames'
import { Button, Checkbox, Col, Form, Icon, Popover, Row } from 'antd'
import FilterIcon from '@components/ColumnTitle/filter-solid.svg?react'
import { useTranslation } from 'react-i18next'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import TemplatedTitle from '@components/TemplatedTitle/TemplatedTitle'
import { useAppSelector } from '@store'
import { useRowSelection } from '@components/widgets/Table/massOperations/hooks/useRowSelection'
import { FilterType as CoreFilterType } from '@cxbox-ui/core'
import { actions } from '@actions'
import { useDispatch } from 'react-redux'
import { filterByConditions } from '@utils/filterByConditions'
import { FIELDS } from '@constants'
import styles from './ColumnTitle.module.less'

interface ColumnTitleProps {
    title: string
    widgetName: string
    bcName: string
    filterable?: boolean
    fieldName: typeof FIELDS.TECHNICAL.ID
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({ widgetName, bcName, filterable, fieldName, title }) => {
    const { t } = useTranslation()
    const { visibility, changeVisibility } = useVisibility(false)
    const { selectedRows, selectedRowKeys } = useRowSelection(widgetName)
    const viewName = useAppSelector(state => state.view.name)
    const resultFilterEnabled = useAppSelector(state => state.screen.viewerMode[bcName]?.resultFilterEnabled)
    const { visibility: successChecked, changeVisibility: changeSuccessChecked } = useVisibility(null as any)
    const { visibility: failChecked, changeVisibility: changeFailChecked } = useVisibility(null as any)
    const filterApplied = successChecked || failChecked

    const dispatch = useDispatch()

    const handleApply = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            if (successChecked === null && failChecked === null) {
                return
            }
            const allSelectedRows = selectedRows ?? []
            const [successRows, failRows] = filterByConditions(allSelectedRows, [
                item => item.success === true,
                item => item.success === false
            ])
            dispatch(
                actions.bcAddFilter({
                    bcName: bcName as string,
                    filter: {
                        type: CoreFilterType.equalsOneOf,
                        value:
                            !successChecked && !failChecked
                                ? selectedRowKeys
                                : successChecked && failChecked
                                ? [...successRows, ...failRows].map(item => item.id)
                                : successChecked
                                ? successRows.map(item => item.id)
                                : failChecked
                                ? failRows.map(item => item.id)
                                : [],
                        fieldName,
                        viewName,
                        widgetName: widgetName
                    },
                    widgetName: widgetName
                })
            )
            dispatch(actions.setMassResultFilterEnabled({ bcName, enabled: true }))
            dispatch(actions.bcForceUpdate({ bcName }))
            changeVisibility(false)
        },
        [bcName, changeVisibility, dispatch, failChecked, fieldName, selectedRowKeys, selectedRows, successChecked, viewName, widgetName]
    )

    const handleCancel = useCallback(() => {
        dispatch(
            actions.bcAddFilter({
                bcName: bcName as string,
                filter: {
                    type: CoreFilterType.equalsOneOf,
                    value: selectedRowKeys,
                    fieldName,
                    viewName,
                    widgetName: widgetName
                },
                widgetName: widgetName
            })
        )

        dispatch(actions.setMassResultFilterEnabled({ bcName, enabled: false }))
        dispatch(actions.bcForceUpdate({ bcName }))

        changeSuccessChecked(null as any)
        changeFailChecked(null as any)
        changeVisibility(false)
    }, [bcName, changeFailChecked, changeSuccessChecked, changeVisibility, dispatch, fieldName, selectedRowKeys, viewName, widgetName])

    useEffect(() => {
        if (resultFilterEnabled === false) {
            handleCancel()
        }
    }, [handleCancel, resultFilterEnabled])

    const content = (
        <Form onSubmit={handleApply} layout="vertical">
            <Row gutter={[0, 5]}>
                <Col className={styles.checkboxContainer} span={24}>
                    <Checkbox
                        className={styles.checkbox}
                        checked={successChecked}
                        onChange={event => changeSuccessChecked(event.target.checked)}
                    />
                    <Icon className={styles.columnIcon} type="check-circle" theme="filled" />
                </Col>
                <Col className={styles.checkboxContainer} span={24}>
                    <Checkbox
                        className={styles.checkbox}
                        checked={failChecked}
                        onChange={event => changeFailChecked(event.target.checked)}
                    />
                    <Icon className={styles.columnIcon} type="close-square" theme="filled" />
                </Col>
            </Row>
            <div className={styles.operators}>
                <Button className={styles.button} data-test-filter-popup-apply={true} htmlType="submit">
                    {t('Apply')}
                </Button>
                <Button className={styles.button} data-test-filter-popup-clear={true} onClick={handleCancel}>
                    {t('Clear')}
                </Button>
            </div>
        </Form>
    )

    return (
        <div className={cn(styles.container)}>
            <TemplatedTitle widgetName={widgetName} title={title} />
            {filterable && (
                <Popover trigger="click" content={content} visible={visibility} onVisibleChange={changeVisibility}>
                    <div
                        className={cn(styles.icon, {
                            [styles.active]: filterApplied
                        })}
                        data-test-widget-list-header-column-filter={true}
                    >
                        <FilterIcon />
                    </div>
                </Popover>
            )}
        </div>
    )
}

export default React.memo(ColumnTitle)
