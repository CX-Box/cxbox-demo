import React, { useCallback } from 'react'
import styles from './TextSearchInput.less'
import { actions } from '@actions'
import { useDispatch } from 'react-redux'
import { useDebouncedTextSearch, useSearchWarning } from '@hooks/search'
import SearchInput from '../SearchInput/SearchInput'
import { useTranslation } from 'react-i18next'
import { Icon, Popover } from 'antd'
import { useAppSelector } from '@store'

interface TextSearchInputProps {
    bcName: string
    placeholder?: string
}

const TextSearchInput = ({ bcName, placeholder }: TextSearchInputProps) => {
    const filter = useAppSelector(state => state.screen.fullTextFilter[bcName])

    const dispatch = useDispatch()

    const handleSearch = useCallback(() => {
        dispatch(actions.bcChangePage({ bcName, page: 1 }))
    }, [dispatch, bcName])

    const handleInputValue = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(
                actions.changeBcFullTextFilter({
                    bcName,
                    fullTextFilterValue: (e.target.value || null) as string
                })
            )
        },
        [bcName, dispatch]
    )

    useDebouncedTextSearch(filter, handleSearch)
    const { t } = useTranslation()

    const showWarning = useSearchWarning(filter)

    return (
        <Popover
            visible={showWarning}
            placement="bottomLeft"
            content={
                <span>
                    <Icon type="warning" style={{ marginRight: 4 }} />
                    {t('Enter three or more characters')}
                </span>
            }
        >
            <SearchInput value={filter} onChange={handleInputValue} className={styles.container} placeholder={placeholder} />
        </Popover>
    )
}

export default React.memo(TextSearchInput)
