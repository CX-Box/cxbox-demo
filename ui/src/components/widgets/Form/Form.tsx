import React from 'react'
import { WidgetFormMeta } from '@cxbox-ui/core/interfaces/widget'
import { FormWidget } from '@cxbox-ui/core'
import styles from './Form.less'

interface FormProps {
    meta: WidgetFormMeta
}

function Form({ meta }: FormProps) {
    return (
        <div className={styles.formContainer}>
            <FormWidget meta={meta} />
        </div>
    )
}

export default React.memo(Form)
