import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Icon, Select as AntdSelect } from 'antd'
import cn from 'classnames'
import Select from '@components/ui/Select/Select'
import { DataValue, WidgetTypes } from '@cxbox-ui/schema'
import { actions, FieldType, InlinePickListFieldMeta, interfaces } from '@cxbox-ui/core'
import { useDebounce } from '@hooks/useDebounce'
import ReadOnlyField from '../../components/ui/ReadOnlyField/ReadOnlyField'
import { useAppSelector } from '@store'
import useFixSelectDropdownForTableScroll from '@hooks/useFixSelectDropdownForTableScroll'
import { BaseFieldProps } from '@components/Field/Field'
import { buildBcUrl } from '@utils/buildBcUrl'
import { isPopupWidgetFamily } from '@utils/isPopupWidgetFamily'
import { ReactComponent as folder } from '../../assets/icons/folder.svg'
import styles from './InlinePickList.less'

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

    const selectRef = useRef<AntdSelect<string>>(null)

    const neededSearch = meta.type === FieldType.inlinePickList
    const getUniqueDataTestAttr = (postfix: string) => {
        return { [`data-test-field-${meta.type?.toLowerCase()?.replace(/-/g, '')}-${postfix}`]: true }
    }
    const widgetMeta = useAppSelector(state => state.view.widgets?.find(i => i.name === widgetName))
    const disabledPopup = isPopupWidgetFamily(widgetMeta?.type)
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

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    const handleFocus = useCallback(() => onSearch(popupBcName, processedSearchSpec, ''), [onSearch, popupBcName, processedSearchSpec])

    React.useEffect(() => {
        if (debouncedSearchTerm && processedSearchSpec) {
            onSearch(popupBcName, processedSearchSpec, debouncedSearchTerm)
        }
    }, [debouncedSearchTerm, onSearch, popupBcName, processedSearchSpec])

    const handleClick = useCallback(() => {
        if (!disabled) {
            onClick(popupBcName, pickMap, popupWidget?.name)
        }
    }, [disabled, popupBcName, pickMap, onClick, popupWidget])

    const onChange = useCallback(
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

    const handleDropdownVisibleChange = useFixSelectDropdownForTableScroll(selectRef)

    if (readOnly) {
        return (
            <ReadOnlyField
                widgetName={widgetName}
                meta={meta}
                className={className}
                backgroundColor={backgroundColor}
                cursor={cursor}
                onDrillDown={onDrillDown}
            >
                {value}
            </ReadOnlyField>
        )
    }

    const popupOpenButton = !disabledPopup && (
        <Icon
            className={cn(styles.openIcon, { [styles.disabledButton]: disabled })}
            {...getUniqueDataTestAttr('popup')}
            component={folder}
            onClick={!disabled ? handleClick : undefined}
        />
    )

    return (
        <span className={cn(styles.container, { [styles.withoutPopupOpenButton]: disabledPopup })}>
            <Select
                className={cn(className, styles.select)}
                disabled={disabled}
                value={value ?? undefined}
                allowClear={!!value}
                showSearch={neededSearch}
                placeholder={placeholder ?? t('Enter value')}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={setSearchTerm}
                onFocus={neededSearch ? handleFocus : undefined}
                onChange={onChange}
                notFoundContent={null}
                getPopupContainer={trigger => trigger.parentElement?.parentElement as HTMLElement}
                forwardedRef={selectRef}
                onDropdownVisibleChange={handleDropdownVisibleChange}
                clearIcon={<Icon {...getUniqueDataTestAttr('clear')} type="close-circle" />}
            >
                {neededSearch &&
                    data.map(item => {
                        const title = item[pickMap[fieldName]] as string
                        return (
                            <Select.Option title={title} key={item.id} value={item.id}>
                                <span {...getUniqueDataTestAttr('item')}>{title}</span>
                            </Select.Option>
                        )
                    })}
            </Select>
            {popupOpenButton}
        </span>
    )
}

export default React.memo(InlinePickList)
