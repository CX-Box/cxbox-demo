import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { AppState } from '../interfaces/storeSlices'

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
