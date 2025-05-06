import React, { useCallback, useRef, useState } from 'react'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'
import { ChangeDataItemPayload, BaseFieldProps } from '@cxboxComponents/Field/Field'
import Select from '@cxboxComponents/ui/Select/Select'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon, Select as AntdSelect } from 'antd'
import cn from 'classnames'
import { RootState } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@hooks/useDebounce'
import { buildBcUrl } from '@utils/buildBcUrl'
import { isPopupWidgetFamily } from '@utils/isPopupWidgetFamily'
import useFixSelectDropdownForTableScroll from '@hooks/useFixSelectDropdownForTableScroll'
import styles from './InlinePickList.less'

const { changeDataItem, inlinePickListFetchDataRequest, showViewPopup, viewPutPickMap } = actions

interface InlinePickListOwnProps extends BaseFieldProps {
    fieldName: string
    searchSpec: string
    bcName: string
    popupBcName: string
    pickMap: interfaces.PickMap
    value?: string
    placeholder?: string
}

interface InlinePickListProps extends InlinePickListOwnProps {
    widgetMeta: interfaces.WidgetMeta | undefined
    data: interfaces.DataItem[]
    onClick: (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => void
    onChange: (payload: ChangeDataItemPayload) => void
    onSearch: (bcName: string, searchSpec: string, searchString: string) => void
}

/**
 *
 * @param props
 * @category Components
 */
const InlinePickList: React.FunctionComponent<InlinePickListProps> = ({
    searchSpec,
    popupBcName,
    widgetName,
    pickMap,
    disabled,
    data,
    bcName,
    cursor,
    readOnly,
    className,
    meta,
    backgroundColor,
    value,
    placeholder,
    fieldName,
    onClick,
    onChange,
    onSearch,
    onDrillDown,
    widgetMeta
}) => {
    const { t } = useTranslation()

    const selectRef = useRef<AntdSelect<string>>(null)

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)
    const disabledPopup = isPopupWidgetFamily(widgetMeta?.type)

    React.useEffect(() => {
        if (debouncedSearchTerm) {
            onSearch(popupBcName, searchSpec, searchTerm)
        }
    }, [debouncedSearchTerm, onSearch, popupBcName, searchSpec, searchTerm])

    const handleClick = useCallback(() => {
        if (!disabled) {
            onClick(popupBcName, pickMap, widgetName)
        }
    }, [disabled, popupBcName, pickMap, onClick, widgetName])

    const handleChange = useCallback(
        (valueKey: string) => {
            const row = data.find(item => item.id === valueKey)
            Object.keys(pickMap).forEach(field => {
                onChange({
                    bcName,
                    cursor: cursor as string,
                    dataItem: { [field]: row ? row[pickMap[field]] : '' }
                })
            })
        },
        [onChange, pickMap, bcName, cursor, data]
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
        <span className={cn(styles.buttonContainer, { [styles.disabledButton]: disabled })} onClick={!disabled ? handleClick : undefined}>
            <Icon data-test-field-inlinepicklist-popup={true} type="paper-clip" />
        </span>
    )

    return (
        <span className={cn(styles.inlinePickList, { [styles.withoutPopupOpenButton]: disabledPopup })}>
            <Select
                disabled={disabled}
                value={value}
                allowClear={!!value}
                clearIcon={<Icon data-test-field-inlinepicklist-clear={true} type="close-circle" theme="filled" />}
                showSearch
                placeholder={placeholder ?? t('Enter value')}
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
                onSearch={setSearchTerm}
                onChange={handleChange as any}
                notFoundContent={null}
                className={className}
                getPopupContainer={trigger => trigger.parentElement?.parentElement as HTMLElement}
                forwardedRef={selectRef}
                onDropdownVisibleChange={handleDropdownVisibleChange}
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
            {popupOpenButton}
        </span>
    )
}

const emptyData: interfaces.DataItem[] = []

function mapStateToProps(state: RootState, ownProps: InlinePickListOwnProps) {
    return {
        data: state.data[ownProps.popupBcName] || emptyData,
        widgetMeta: state.view.widgets?.find(i => i.name === ownProps.widgetName)
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    onChange: (payload: ChangeDataItemPayload) => {
        return dispatch(changeDataItem({ ...payload, bcUrl: buildBcUrl(payload.bcName, true) }))
    },
    onClick: (bcName: string, pickMap: interfaces.PickMap, widgetName?: string) => {
        dispatch(showViewPopup({ bcName }))
        dispatch(viewPutPickMap({ map: pickMap, bcName }))
    },
    onSearch: (bcName: string, searchSpec: string, searchString: string) => {
        dispatch(inlinePickListFetchDataRequest({ bcName, searchSpec, searchString }))
    }
})

/**
 * @category Components
 */
export default connect(mapStateToProps, mapDispatchToProps)(InlinePickList)
