export enum FORM_CONTROL_TYPE {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    HEADING = 'heading',
    HIDDEN = 'hidden',
    OBJECT = 'object',
}

interface LabeledFormControlBase {
    label?: string;
}

interface FormControlBase extends LabeledFormControlBase{
    property: string;
}


interface TextFormControl extends FormControlBase {
    type?: FORM_CONTROL_TYPE.TEXT;
}

interface NumericFormControl extends FormControlBase {
    type: FORM_CONTROL_TYPE.NUMBER;
    min?: number;
    max?: number;
    step?: number;
}

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectFormControl extends FormControlBase {
    type: FORM_CONTROL_TYPE.SELECT;
    returnType?: FORM_CONTROL_TYPE.NUMBER;
    options: SelectOption[];
}

interface HiddenFormControl extends FormControlBase {
    type: FORM_CONTROL_TYPE.HIDDEN
}

interface FormHeading extends LabeledFormControlBase{
    type: FORM_CONTROL_TYPE.HEADING;
}

interface ObjectFormControl extends FormControlBase {
    type: FORM_CONTROL_TYPE.OBJECT;
    controls?: FormControl[];
}

export type FormControl = NumericFormControl | TextFormControl | SelectFormControl | FormHeading | HiddenFormControl | ObjectFormControl;