import { useCallback, useState } from 'react'

export const useExpandableGroup = () => {
    const [expandedParentRowKeys, setExpandedParentRowKeys] = useState<string[]>([])

    const changeExpand = useCallback((expanded, id) => {
        if (id) {
            setExpandedParentRowKeys(prevState => {
                if (expanded) {
                    return prevState.includes(id) ? prevState : [...prevState, id]
                } else {
                    return prevState.filter(prevRecordId => prevRecordId !== id)
                }
            })
        }
    }, [])

    const clearExpand = useCallback(() => {
        setExpandedParentRowKeys(prevKeys => (prevKeys.length === 0 ? prevKeys : []))
    }, [])

    return { expandedParentRowKeys, changeExpand, clearExpand }
}
