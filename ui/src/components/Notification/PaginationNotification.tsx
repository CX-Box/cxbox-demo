import React, { useEffect } from 'react'
import { Icon, Select } from 'antd'
import cn from 'classnames'
import styles from './PaginationNotification.less'
import { generateRange } from '../../utils/range'
import { useStompNotification } from '../../hooks/notification'

export interface PaginationNotificationOwnProps {
    onChangePage?: () => void
}

interface PaginationNotificationProps extends PaginationNotificationOwnProps {}

interface PageInfo {
    pageNumber: number
    separator?: boolean
}

const PAGES_TO_SHOW = 5
const LIMIT_OPTIONS = [5, 10, 15]
const SEPARATOR: PageInfo = { pageNumber: -1, separator: true }
const SEPARATOR_CONTENT = '...'

const numberToPageInfo = (num: number): PageInfo => ({ pageNumber: num })

const generateDisplayedPageNumbers = (pageCount: number, currentPage: number, pagesToShow: number) => {
    const pageNumbers: PageInfo[] = []

    if (pageCount <= pagesToShow) {
        pageNumbers.push(...generateRange(1, pageCount).map(numberToPageInfo))
    } else {
        const pageCountCeil = Math.ceil(pagesToShow / 2)
        const pageCountFloor = Math.floor(pagesToShow / 2)
        if (currentPage <= pageCountCeil) {
            pageNumbers.push(...generateRange(1, pagesToShow).map(numberToPageInfo))
            if (currentPage + pagesToShow < pageCount) {
                pageNumbers.push(SEPARATOR, numberToPageInfo(pageCount))
                return pageNumbers
            }
        } else {
            const pageToStart = currentPage - pageCountFloor
            pageNumbers.push(numberToPageInfo(1))
            if (pageToStart > 2) {
                pageNumbers.push(SEPARATOR)
            }
            pageNumbers.push(...generateRange(pageToStart, currentPage).map(numberToPageInfo))
        }
        if (currentPage > pageCount - pageCountCeil) {
            pageNumbers.push(...generateRange(currentPage + 1, pageCount).map(numberToPageInfo))
        } else {
            pageNumbers.push(
                ...generateRange(currentPage + 1, currentPage + pageCountFloor)
                    .filter(num => !pageNumbers.some(pageNumber => pageNumber.pageNumber === num))
                    .map(numberToPageInfo)
            )
            if (currentPage < pageCount - pageCountCeil) {
                pageNumbers.push(SEPARATOR)
            }
            pageNumbers.push(numberToPageInfo(pageCount))
        }
    }

    return pageNumbers
}

const PaginationNotification = (props: PaginationNotificationProps) => {
    const pagesToShow = PAGES_TO_SHOW
    const showSelectOptions = true
    const { changePage: changeNotificationPage, state: notificationState } = useStompNotification()
    const notificationCount = notificationState.count
    const page = notificationState.page
    const limit = notificationState.limit
    const pageCount = Math.ceil((notificationCount ?? 0) / limit)
    const showPagination = pageCount > 1
    const [limitOptions, setLimitOptions] = React.useState(LIMIT_OPTIONS)

    useEffect(() => {
        if (limit && !limitOptions.includes(limit)) {
            setLimitOptions([...limitOptions, limit])
        }
    }, [limit, limitOptions, setLimitOptions])

    const onPrevPage = React.useCallback(() => {
        if (page > 1) {
            changeNotificationPage(page - 1, limit)
        }
    }, [page, changeNotificationPage, limit])

    const onNextPage = React.useCallback(() => {
        if (page < pageCount) {
            changeNotificationPage(page + 1, limit)
        }
    }, [page, pageCount, changeNotificationPage, limit])

    const createPageHandler = (pageNumber: number) => () => {
        if (pageNumber !== page) {
            changeNotificationPage(pageNumber, limit)
        }
    }

    const pageNumbers: PageInfo[] = React.useMemo(
        () => generateDisplayedPageNumbers(pageCount, page, pagesToShow),
        [pageCount, page, pagesToShow]
    )

    const handleLimitChange = (value: number) => {
        changeNotificationPage(1, value)
    }

    return (
        <>
            {showPagination && (
                <div className={styles.container}>
                    <div className={styles.pagination}>
                        <div
                            onKeyUp={onPrevPage}
                            role="button"
                            tabIndex={0}
                            className={cn(styles.item, { [styles.disabled]: page === 1 })}
                            onClick={onPrevPage}
                        >
                            <Icon type="left" />
                        </div>
                        {pageNumbers?.map(({ pageNumber, separator }, index) => (
                            <div
                                className={cn(styles.item, {
                                    [styles.active]: pageNumber === page
                                })}
                                role="button"
                                tabIndex={0}
                                onKeyUp={separator ? undefined : createPageHandler(pageNumber)}
                                onClick={separator ? undefined : createPageHandler(pageNumber)}
                                key={pageNumber === -1 ? SEPARATOR_CONTENT + index : pageNumber}
                            >
                                {separator ? SEPARATOR_CONTENT : pageNumber}
                            </div>
                        ))}
                        <div
                            onKeyUp={onNextPage}
                            role="button"
                            tabIndex={0}
                            className={cn(styles.item, {
                                [styles.disabled]: page === pageCount || pageCount === 0
                            })}
                            onClick={onNextPage}
                        >
                            <Icon type="right" />
                        </div>
                    </div>
                    {showSelectOptions && (
                        <Select
                            dropdownClassName={styles.dropdown}
                            dropdownMatchSelectWidth={false}
                            onChange={handleLimitChange}
                            value={limit}
                        >
                            {LIMIT_OPTIONS.map(option => (
                                <Select.Option value={option} key={option}>
                                    {option} / page
                                </Select.Option>
                            ))}
                            {!LIMIT_OPTIONS.includes(limit) && (
                                <Select.Option value={limit} key={limit}>
                                    {limit} / page
                                </Select.Option>
                            )}
                        </Select>
                    )}
                </div>
            )}
        </>
    )
}

export default PaginationNotification
