import { WidgetField } from '@interfaces/widget'

/**
 * Filling a form from an attached document: what the platform answers and what the form shows.
 */

/**
 * Where the value came from. Decided by the platform, not reported by the model:
 * label - the caption of the document matched the field, the project wrote that caption down or it says so itself;
 * dictionary - the model matched a value of the dictionary to what the document says in other words;
 * text - the model read it out of the plain text and the value was found in the document;
 * guess - there is no such text in the document;
 * manual - the person bound the value to the field by hand.
 */
export type AiExtractMatch = 'label' | 'dictionary' | 'text' | 'guess' | 'manual'

/** Place on the page, share of the page side, origin in the top left corner. */
export interface AiExtractBox {
    page: number
    x: number
    y: number
    width: number
    height: number
}

export interface AiExtractField {
    /** identity of the field on the screen: widget and key together */
    id: string
    key: string
    /** name of the widget this field is rendered by */
    widget?: string
    value: string
    confidence: number
    match: AiExtractMatch
    /** number of the pair the value came from, empty when it was read from plain text */
    pair?: number
    /** what the document says when the value is not that text word for word, as happens with a dictionary */
    documentValue?: string
    /** other pairs that suit this field, most suitable first: a wrong guess is corrected in one click */
    alternatives?: number[]
    box?: AiExtractBox
}

/** Pair "caption - value" of the document. Every pair can be bound to a field by hand. */
export interface AiExtractPair {
    index: number
    label: string
    value: string
    box?: AiExtractBox
}

export interface AiExtractPage {
    number: number
    width: number
    height: number
}

export interface AiExtractResult {
    pages: AiExtractPage[]
    fields: AiExtractField[]
    pairs: AiExtractPair[]
    notFound: string[]
    recognizer: string
    model: string
    durationMs: number
}

/**
 * Field of the form a value is looked for, together with the widget it is rendered by. Two widgets of one
 * screen can have a field with the same key and a different meaning, so the widget is part of the identity.
 */
export interface AiExtractTarget {
    id: string
    key: string
    label?: string
    type?: string
    required?: boolean
    allowed?: string[]
    /** optional constraints of the widget json: captions of the document, a pattern of the value, a phrase for the model */
    labels?: string[]
    pattern?: string
    description?: string
    bcName: string
    widget: string
    /** title the person sees above the widget, "Ответчик": this is what the model is told */
    widgetTitle?: string
    meta: WidgetField
}

export interface AiExtractRequest {
    fileId: string
    bcName: string
    fields: Array<Omit<AiExtractTarget, 'meta'>>
}

/** Three states the person sees: trustworthy, worth a look, composed by the model. */
export const confidenceLevel = (field: Pick<AiExtractField, 'confidence'>) => {
    if (field.confidence >= 0.8) {
        return 'sure' as const
    }

    return field.confidence >= 0.5 ? ('check' as const) : ('guess' as const)
}
