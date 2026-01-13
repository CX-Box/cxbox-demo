import { useAppSelector } from '@store'
import { selectBc } from '@selectors/selectors'

export const useIsActiveRecord = (bcName: string) => {
    const bc = useAppSelector(selectBc(bcName))

    return (id: string | number) => (bc?.cursor ? bc.cursor === id : false)
}
