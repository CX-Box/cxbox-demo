import React from 'react'
import styles from './Form.less'
import { FormWidget } from '@cxboxComponents'
import { interfaces } from '@cxbox-ui/core'

interface FormProps {
    meta: interfaces.WidgetFormMeta
}

function Form({ meta }: FormProps) {
    return (
        <div className={styles.formContainer}>
            <FormWidget meta={meta} />
        </div>
    )
}

export default React.memo(Form)
