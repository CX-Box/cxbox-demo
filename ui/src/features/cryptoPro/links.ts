import { envString } from '@utils/env'
import { DEFAULT_INSTRUCTION_URL } from './constants'

export const CRYPTOPRO_LINKS = {
    instructionUrl: envString('REACT_APP_CRYPTOPRO_INSTRUCTION_LINK') ?? DEFAULT_INSTRUCTION_URL
}
