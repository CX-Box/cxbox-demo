import { useAppSelector } from '@store'
import { selectBc } from '@selectors/selectors'

export const useIsActiveRecord = (bcName: string) => {
    const bc = useAppSelector(state => selectBc(state, bcName))

    return (id: string | number) => (bc?.cursor ? bc.cursor === id : false)
}
