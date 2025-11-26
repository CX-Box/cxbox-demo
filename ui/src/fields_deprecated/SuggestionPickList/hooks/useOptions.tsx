import { useState, useEffect, useRef } from 'react'
import { Option } from 'rc-select'
import { firstValueFrom } from 'rxjs'
import debounce from 'lodash.debounce'
import { createContentList } from '../utils'
import { CxBoxApiInstance } from '../../../api'
import { MIN_SEARCH_VALUE_LENGTH } from '../constants'
import { SuggestionPickListDataItem } from '@interfaces/data'
import { SuggestionPickListWidgetMeta } from '@interfaces/widget'
import styles from '../SuggestionPickList.less'

type DebounceFunc = ReturnType<typeof debounce>

export function useOptions({ widget }: { widget: SuggestionPickListWidgetMeta }) {
    const [isLoading, setIsLoading] = useState(false)
    const [options, setOptions] = useState<SuggestionPickListDataItem[] | undefined>()

    const elements = options?.map(option => {
        const contentList = createContentList(widget, option)

        return (
            <Option key={option.id}>
                <div className={styles.option}>
                    {contentList?.map(text => (
                        <span key={text}>{text}</span>
                    ))}
                </div>
            </Option>
        )
    })

    const fetchDataDebouncedRef = useRef<DebounceFunc>()

    useEffect(() => {
        fetchDataDebouncedRef.current = debounce(
            (screenName: string, fieldBcUrl: string, params: { query: string; _page: number; _limit: number }) => {
                if (params.query?.length >= MIN_SEARCH_VALUE_LENGTH) {
                    setIsLoading(true)
                    firstValueFrom(CxBoxApiInstance.fetchBcData(screenName, fieldBcUrl, params))
                        .then(response => {
                            const data = response.data as unknown as SuggestionPickListDataItem[]

                            setOptions(data)
                        })
                        .catch(error => {
                            console.error(error)
                        })
                        .finally(() => setIsLoading(false))
                }
            },
            500
        )
    }, [])

    return {
        isLoading,
        options,
        elements,
        fetchData: fetchDataDebouncedRef
    }
}
