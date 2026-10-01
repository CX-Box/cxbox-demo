import { AiExtractField } from './types'

/**
 * One place that decides how a value looks to the person, so the form, the frame on the document and the panel
 * never say different things about the same field.
 * <p>
 * Two colours and three icons, and they never say the same thing twice. The colour says where the person is in
 * the work: yellow is still to go through, green is closed. The icon says what the value is: it came from the
 * document, or they typed it themselves, or there is none. Everything the run touched waits for them until they
 * close it, a correction by hand included - a person who corrected a value has not yet said it is right.
 * <p>
 * A field the run never touched wears no mark at all: a mark that means "nothing to see here" is noise.
 * <p>
 * The fourth glyph, the field itself, is never the state of anything: it only ever stands in the past of a
 * value, against what the record held before the run. A line of that past without a glyph of its own reads as a
 * line that slipped out of place, and the eye stops on it instead of reading it.
 * <p>
 * An empty required field is not painted here: the platform already says that in its own way, and saying it
 * twice in two languages is worse than not saying it at all.
 */
export type AiFieldOrigin = 'document' | 'manual' | 'form' | 'none'

export type AiFieldTone = 'wait' | 'risk' | 'done'

interface FieldState {
    origin: AiFieldOrigin
    tone: AiFieldTone
    /** how sure the machine is, or what happened to the value: a word for the card */
    badge: string
    /** one line explaining where the value came from */
    hint: string
}

const SOURCE: Record<string, string> = {
    label: 'the caption of the document matched the field',
    dictionary: 'a value of the dictionary matched by meaning',
    text: 'found in the text of the document',
    guess: 'there is no such text in the document',
    manual: 'bound by hand'
}

export function fieldState(field?: AiExtractField, current?: string, checked?: boolean, removed?: boolean): FieldState {
    if (!field) {
        // An empty field is not a result, it is the lack of one, and it always needs a person: either the value
        // is in the document and the machine missed it, or it is not there and the field is left empty on
        // purpose. Both are decisions, so an empty field waits its turn like any other.
        return {
            origin: 'none',
            tone: checked ? 'done' : 'wait',
            badge: checked ? 'left empty' : removed ? 'cleared' : 'not found',
            hint: removed ? 'the value from the document was taken off this field' : 'nothing for this field was found in the document'
        }
    }
    if (field.match === 'manual' || (current !== undefined && String(current) !== field.value)) {
        // a value corrected by hand still came out of this run and still waits for the person to close it: the
        // correction changes the icon, not the colour
        return {
            origin: 'manual',
            tone: checked ? 'done' : 'wait',
            badge: checked ? 'verified' : 'edited',
            hint: 'the value was corrected by hand'
        }
    }

    return {
        origin: 'document',
        // the value did come out of the document, but the document backs it badly: the same icon, said in red
        tone: checked ? 'done' : field.confidence < 0.5 ? 'risk' : 'wait',
        badge: checked ? 'verified' : `${Math.round(field.confidence * 100)}%`,
        hint: SOURCE[field.match] ?? ''
    }
}
