import { nanoid } from '@reduxjs/toolkit'

export const PREFIX_FOR_TEMP_ID = 'temp_'

export const isFilterGroupTempId = (id: string) => id.startsWith(PREFIX_FOR_TEMP_ID)

export const createFilterGroupTempId = () => `${PREFIX_FOR_TEMP_ID}${nanoid()}`
