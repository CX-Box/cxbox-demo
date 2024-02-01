import React from 'react'
import { Icon, Upload } from 'antd'
import { Popup } from '@cxboxComponents/ui/Popup/Popup'
import styles from './FileUploadPopup.less'
import { useAppDispatch, useAppSelector } from '@store'
import { getFileUploadEndpoint } from '@utils/api'
import { actions } from '@cxbox-ui/core'
import { useTranslation } from 'react-i18next'

/**
 * @category Components
 */
export const FileUploadPopup: React.FC = () => {
    const { t } = useTranslation()
    const popupData = useAppSelector(state => state.view.popupData)
    const dispatch = useAppDispatch()
    const uploadUrl = getFileUploadEndpoint()
    const [ids, setIds] = React.useState<Record<string, string>>({})
    return (
        <div>
            <Popup
                bcName={popupData?.bcName as string}
                showed
                size="medium"
                onOkHandler={() => {
                    dispatch(actions.bulkUploadFiles({ fileIds: Object.values(ids) }))
                }}
                onCancelHandler={() => dispatch(actions.closeViewPopup({ bcName: popupData?.bcName }))}
            >
                <Upload.Dragger
                    className={styles.dragContainer}
                    multiple
                    action={uploadUrl}
                    onChange={info => {
                        if (info.file.status === 'done') {
                            setIds({ ...ids, [info.file.uid]: info.file.response.data.id })
                        }
                    }}
                    onRemove={file => {
                        const newIds = { ...ids }
                        delete newIds[file.uid]
                        setIds(newIds)
                        // TODO: Probably should send delete request
                    }}
                >
                    <div className={styles.icon}>
                        <Icon type="inbox" />
                    </div>
                    <div className={styles.text}>{t('Select files')}</div>
                </Upload.Dragger>
            </Popup>
        </div>
    )
}

/**
 * @category Components
 */
export default React.memo(FileUploadPopup)
