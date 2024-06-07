import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Icon, Select } from 'antd'
import cn from 'classnames'
import { DataValue, WidgetTypes } from '@cxbox-ui/schema'
import { actions, InlinePickListFieldMeta, interfaces } from '@cxbox-ui/core'
import { useDebounce } from '@hooks/useDebounce'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { useAppSelector } from '@store'
import styles from './InlinePickList.less'
import { BaseFieldProps } from '@cxboxComponents/Field/Field'
import { buildBcUrl } from '@utils/buildBcUrl'

interface Props extends Omit<BaseFieldProps, 'meta'> {
    meta: InlinePickListFieldMeta
    value?: string
    placeholder?: string
}

const emptyData: interfaces.DataItem[] = []

const InlinePickList: React.FunctionComponent<Props> = ({
    widgetName,
    disabled,
    cursor,
    readOnly,
    className,
    meta,
    backgroundColor,
    value,
    placeholder,
    onDrillDown
}) => {
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const bcName = widgetMeta?.bcName
    const { key: fieldName, popupBcName, pickMap, searchSpec } = meta
    const data = useAppSelector(state => (bcName && popupBcName && state.data[popupBcName]) || emptyData)

    const popupWidget = useAppSelector(state =>
        state.view.widgets.find(i => i.bcName === popupBcName && i.type === WidgetTypes.PickListPopup)
    )

    const processedSearchSpec = searchSpec || pickMap[fieldName]
    useEffect(() => {
        if (!processedSearchSpec) {
            console.info(
                `Field with key = ${fieldName} was not found on left side of pickMap. Autocomplete will show values without filtration`
            )
        }
    }, [processedSearchSpec, fieldName])

    const onClick = useCallback(
        (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => {
            dispatch(actions.showViewPopup({ bcName, widgetName }))
            dispatch(actions.viewPutPickMap({ map: pickMap, bcName }))
        },
        [dispatch]
    )

    const onSearch = useCallback(
        (bcName: string, searchSpec: string, searchString: string) => {
            dispatch(actions.inlinePickListFetchDataRequest({ bcName, searchSpec, searchString }))
        },
        [dispatch]
    )

    const [searchTerm, setSearchTerm] = React.useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (debouncedSearchTerm && processedSearchSpec) {
            onSearch(popupBcName, processedSearchSpec, searchTerm)
        }
    }, [debouncedSearchTerm, onSearch, popupBcName, processedSearchSpec, searchTerm])

    const handleClick = React.useCallback(() => {
        if (!disabled) {
            onClick(popupBcName, pickMap, popupWidget?.name)
        }
    }, [disabled, popupBcName, pickMap, onClick, popupWidget])

    const onChange = React.useCallback(
        (valueKey: string) => {
            const row = data.find(item => item.id === valueKey)
            const bcNameChanges: Record<string, DataValue> = {}

            Object.keys(pickMap).forEach(field => {
                bcNameChanges[field] = row ? row[pickMap[field]] : ''
            })

            dispatch(
                actions.changeDataItem({
                    bcName: bcName || '',
                    bcUrl: buildBcUrl(bcName || '', true),
                    cursor: cursor || '',
                    dataItem: bcNameChanges
                })
            )
        },
        [pickMap, bcName, cursor, data, dispatch]
    )

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    return (
        <span className={styles.inlinePickList}>
            <Select
                className={cn(className, styles.select)}
                disabled={disabled}
                value={value ?? undefined}
                allowClear={!!value}
                clearIcon={<Icon data-test-field-inlinepicklist-clear={true} type="close-circle" />}
                showSearch
                placeholder={placeholder ?? t('Enter value')}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={setSearchTerm}
                onChange={onChange}
                notFoundContent={null}
            >
                {data.map(item => {
                    const title = item[pickMap[fieldName]] as string
                    return (
                        <Select.Option title={title} key={item.id} value={item.id}>
                            <span data-test-field-inlinepicklist-item={true}>{title}</span>
                        </Select.Option>
                    )
                })}
            </Select>
            <span
                className={cn(styles.buttonContainer, { [styles.disabledButton]: disabled })}
                onClick={!disabled ? handleClick : undefined}
            >
                <Icon data-test-field-inlinepicklist-popup={true} type="paper-clip" />
            </span>
        </span>
    )
}

export default React.memo(InlinePickList)
