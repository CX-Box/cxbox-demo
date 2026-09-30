import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { lastValueFrom } from 'rxjs'
import { DataItem } from '@cxbox-ui/schema'
import { utils } from '@cxbox-ui/core'
import { CxBoxApiInstance } from 'api'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { selectWidget } from '@selectors/selectors'
import { FIELDS } from '@constants'
import { FilterType } from '@interfaces/filters'
import { AppWidgetMeta, CryptoGeneratorItem } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import { getErrorMessage } from '@components/CryptoGeneratorContent/CryptoGeneratorContent'
import {
    createCryptoData,
    CryptoFiles,
    CryptoSettings,
    getCryptoFileBaseNames,
    getCryptoGenerator,
    uploadCryptoData
} from '@components/CryptoGeneratorContent/cryptoFile'

/**
 * Element of `massIds_` for one row: files of the row in `options` (keys of `MassOptionType` on the backend),
 * or the result of the row if the frontend could not process it
 */
interface MassCryptoRow {
    id: string
    options?: Record<string, string>
    success?: false
    errorMessage?: string
}

type RowResult = Omit<MassCryptoRow, 'id'>

export interface MassCryptoProgress {
    done: number
    total: number
}

const toOptions = ({ signature, encrypted }: CryptoFiles): Record<string, string> => ({
    ...(signature && { signatureFileId: signature.id, signatureFileName: signature.name }),
    ...(encrypted && { encryptedFileId: encrypted.id, encryptedFileName: encrypted.name })
})

/**
 * Signs and/or encrypts the files of the selected rows one by one, then sends the mass action once.
 *
 * `stop` ends the processing at once, without waiting for the current row: the mass action is sent for the processed rows,
 * the other rows get an error. Leaving the step ends the processing too, and then the mass action is not sent.
 */
export const useMassCrypto = (widgetName: string, bcName: string, operationType: string) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const screenName = useAppSelector(state => state.screen.screenName)
    const selectedRows = useAppSelector(state => state.view.selectedRows[bcName])
    const cryptoGenerator = getCryptoGenerator(widget, operationType)

    const [progress, setProgress] = useState<MassCryptoProgress | null>(null)
    const [processing, setProcessing] = useState(false)
    const stopRef = useRef<(() => void) | null>(null)
    const unmountedRef = useRef(false)

    useEffect(() => {
        return () => {
            unmountedRef.current = true
            stopRef.current?.()
        }
    }, [])

    const stop = useCallback(() => {
        stopRef.current?.()
    }, [])

    const processRow = useCallback(
        async (
            record: DataItem | undefined,
            settings: CryptoSettings,
            config: CryptoGeneratorItem,
            verify: boolean
        ): Promise<RowResult> => {
            const fileId = record?.[config.documentFileIdKey!] as string | undefined

            if (!fileId) {
                return { success: false, errorMessage: t('There is no file in this row') }
            }

            try {
                const response = await CxBoxApiInstance.getFile(fileId)
                const cryptoData = await createCryptoData(response.data, settings, verify)
                const files = await uploadCryptoData(cryptoData, settings.generatorType, config, getCryptoFileBaseNames(record, config))

                return files.signature || files.encrypted
                    ? { options: toOptions(files) }
                    : { success: false, errorMessage: t('No files were created') }
            } catch (e) {
                return { success: false, errorMessage: getErrorMessage(e) }
            }
        },
        [t]
    )

    const run = useCallback(
        async (settings: CryptoSettings, send: () => void) => {
            if (!cryptoGenerator || !selectedRows?.length) {
                return
            }

            const ids = selectedRows.map(row => row.id as string)
            const results = new Map<string, RowResult>()
            let stopped = false
            const stopSignal = new Promise<null>(resolve => {
                stopRef.current = () => {
                    stopped = true
                    resolve(null)
                }
            })

            setProcessing(true)
            setProgress({ done: 0, total: ids.length })

            try {
                const records = await Promise.race([
                    lastValueFrom(
                        CxBoxApiInstance.fetchBcDataAll(screenName, buildBcUrl(bcName), {
                            ...utils.getFilters([{ fieldName: FIELDS.TECHNICAL.ID, type: FilterType.equalsOneOf, value: ids }]),
                            _limit: ids.length
                        })
                    ),
                    stopSignal
                ])
                // signature is checked until the first success: the same certificate signs every row
                let verified = false

                for (const id of ids) {
                    if (stopped || !records) {
                        break
                    }

                    const result: RowResult | null = await Promise.race([
                        processRow(
                            records.find(item => item.id === id),
                            settings,
                            cryptoGenerator,
                            !verified
                        ),
                        stopSignal
                    ])

                    if (!result) {
                        break
                    }

                    verified = verified || !!result.options
                    results.set(id, result)
                    setProgress({ done: results.size, total: ids.length })
                }
            } catch (e) {
                const errorMessage = getErrorMessage(e)
                ids.forEach(id => results.has(id) || results.set(id, { success: false, errorMessage }))
            }

            stopRef.current = null

            if (unmountedRef.current) {
                return
            }

            setProcessing(false)

            const rows: MassCryptoRow[] = ids.map(id => ({
                // selectRows merges the fields: undefined clears the values of a previous run of the step
                id,
                options: undefined,
                success: undefined,
                errorMessage: undefined,
                ...(results.get(id) ?? { success: false, errorMessage: t('Interrupted') })
            }))
            // selected rows keep `options` only to send them with the mass action, DataItem has no object values
            dispatch(actions.selectRows({ bcName, dataItems: rows as unknown as Array<Omit<DataItem, 'vstamp'>> }))
            // the progress stays until the results step; if the action fails, the step is repeated with Back
            send()
        },
        [bcName, cryptoGenerator, dispatch, processRow, screenName, selectedRows, t]
    )

    return { progress, processing, run, stop }
}
