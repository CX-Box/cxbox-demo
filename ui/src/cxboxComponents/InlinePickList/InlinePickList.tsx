import React from 'react'
import ReadOnlyField from '@cxboxComponents/ui/ReadOnlyField/ReadOnlyField'
import { ChangeDataItemPayload, BaseFieldProps } from '@cxboxComponents/Field/Field'
import Select from '@cxboxComponents/ui/Select/Select'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { Icon } from 'antd'
import styles from './InlinePickList.less'
import cn from 'classnames'
import { RootState } from '@store'
import { actions, interfaces } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@hooks/useDebounce'
import { buildBcUrl } from '@utils/buildBcUrl'

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
    onDrillDown
}) => {
    const { t } = useTranslation()

    const [searchTerm, setSearchTerm] = React.useState('')
    const debouncedSearchTerm = useDebounce(searchTerm, 500)

    React.useEffect(() => {
        if (debouncedSearchTerm) {
            onSearch(popupBcName, searchSpec, searchTerm)
        }
    }, [debouncedSearchTerm, onSearch, popupBcName, searchSpec, searchTerm])

    const handleClick = React.useCallback(() => {
        if (!disabled) {
            onClick(popupBcName, pickMap, widgetName)
        }
    }, [disabled, popupBcName, pickMap, onClick, widgetName])

    const handleChange = React.useCallback(
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

    return (
        <span className={styles.inlinePickList}>
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

const emptyData: interfaces.DataItem[] = []
function mapStateToProps(state: RootState, ownProps: InlinePickListOwnProps) {
    return {
        data: state.data[ownProps.popupBcName] || emptyData
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
