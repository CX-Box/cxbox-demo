import React from 'react'
import { FieldType } from '@cxbox-ui/schema'
import Title from '@components/widgets/Table/massOperations/Title'
import { useTranslation } from 'react-i18next'
import { FAIL_COLOR, SUCCESS_COLOR } from '@components/widgets/Table/massOperations/constants'

interface TitleWithResultProps {
    processed: number
    success: number
    fail: number
}

const TitleWithResult: React.FC<TitleWithResultProps> = ({ processed, fail, success }) => {
    const { t } = useTranslation()

    return (
        <Title
            level={2}
            title={`${t('Processed')}: \${processed} (\${success} ${t('Success')}, \${fail} ${t('Fail')})`}
            fields={[
                { title: '', key: 'processed', type: FieldType.number },
                { title: '', key: 'success', type: FieldType.number, bgColor: SUCCESS_COLOR },
                { title: '', key: 'fail', type: FieldType.number, bgColor: FAIL_COLOR }
            ]}
            dataItem={{ id: 'title-with-result-mass', processed, success, fail }}
        />
    )
}

export default TitleWithResult
