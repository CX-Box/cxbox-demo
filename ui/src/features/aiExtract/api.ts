import { CxBoxApiInstance } from '../../api'
import { AiExtractRequest, AiExtractResult } from './types'

export const requestAiExtract = (request: AiExtractRequest) =>
    CxBoxApiInstance.api$.instance.post<AiExtractResult>('ai/extract', request).then(response => response.data)
