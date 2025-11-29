import { FORM_CONTROL_TYPE, FormControl } from "def/form";
import { domCreate } from "domCreate";
import { Watched } from "watched";

export class FormEditor<T extends Object> {
    private form = domCreate('form', {
        classList: ['form-editor'],
    });

    private readonly fieldMap = new Map<string, FORM_CONTROL_TYPE>();

    readonly formValid = new Watched(false);
    readonly working = new Watched(false);

    constructor(
        formControls: FormControl[],
    ) {
        const { form } = this;
        form.addEventListener('submit', evt => this.onSubmitClick(evt));

        this.generateControls(formControls, form);
        this.generateActions();

        form.addEventListener('change', () => this.checkValidity());
    }

    setValue(value: T) {
        this.updateValues(value, this.form);
        this.checkValidity();
        console.log('setValue', value, 'was called, valid?', this.form.checkValidity())
    }

    getValue(
        form: HTMLFormElement | HTMLFieldSetElement = this.form,
        accumulator: Record<string, unknown> = {}
    ): T {
        const value: Record<string, unknown> = {};
        const fieldMap = this.fieldMap;
        const all = [...form.elements].filter(e => e.hasAttribute('name')) as HTMLFormElement[];
        const directDescendants = all
            .filter(e => e.hasAttribute('name') &&  e.closest('form, fieldset') === form)
            .map(element => {
                const e = (element as HTMLFormElement);
                const propertyName = e.name;
                switch (fieldMap.get(propertyName)) {
                    case FORM_CONTROL_TYPE.NUMBER:
                        accumulator[propertyName] = +e.value;
                        break;
                    default:
                        accumulator[propertyName] = e.value;
                }
                return element;
            });
        all.filter(e => directDescendants.indexOf(e) === -1 && e.parentElement?.closest('form, fieldset') === form)
            .forEach(e => accumulator[e.name] = this.getValue(e, {}));
            
        return accumulator as T;
    }

    appendTo(element: HTMLElement): this {
        element.appendChild(this.form);
        return this;
    }

    private onSubmitCallback?: (value: T) => void;
    onSubmit(cb: (value: T) => void): this {
        this.onSubmitCallback = cb;
        return this;
    }

    private onSubmitClick(evt: SubmitEvent) {
        evt.preventDefault();
        this.working.set(true);
        const valid = this.form.checkValidity();
        if (valid) {
            const cb = this.onSubmitCallback;
            if (cb) cb(this.getValue());
        }
        this.working.set(false);   
    }

    private onCancelCallback?: () => void;
    onCancel(cb: () => void): this {
        this.onCancelCallback = cb;
        return this;
    }
    private onCancelClick() {
        if (this.onCancelCallback) {
            this.onCancelCallback();
        }
    }

    private updateValues(value: T, form: HTMLFormElement | HTMLFieldSetElement) {
        const controls = form.elements;
        Object.entries(value)
            .forEach(([k, v]) => {
                const type = this.fieldMap.get(k);
                const control = controls.namedItem(k);
                if (type && control) {
                    if ('value' in control) {
                        control.value = v;
                    } else if (control instanceof HTMLFieldSetElement) {
                        this.updateValues(v, control)
                    } else {
                        console.warn('unable to handle', { type, control, value, form })
                    }
                }
            })
    }

    private generateActions() {
        const actions = domCreate('div', { classList: ['form-actions-container'] }, this.form);
        
        // submit button
        const submit = domCreate('button', { inner: 'Ok' }, actions);
        submit.type = 'submit';
        Watched.combine(
            this.formValid,
            this.working,
        ).watch(([valid, working]) => {
            const disabled = !valid || !!working;
            this.formValid.watch(v => submit.disabled = disabled);
        });

        // cancel button
        const cancel = domCreate('button', {inner: 'Cancel'}, actions);
        cancel.type = 'button';
        this.working.watch(working => cancel.disabled = !!working);
        cancel.addEventListener('click', () => this.onCancelClick());
    }

    private generateControls(controls: FormControl[], appendTo: HTMLElement, flushCache = true) {
        const cache = this.fieldMap;
        if (flushCache) {
            cache.clear();
        }
        controls.forEach(c => {
            if ('property' in c && c.type) {
                const cacheAs = ('returnType' in c && c.returnType) ? c.returnType : c.type;
                cache.set(String(c.property), cacheAs);
            }
            switch (c.type) {
                case FORM_CONTROL_TYPE.HEADING:
                    appendTo.appendChild(domCreate('legend', { classList: ['form-control-legend'], inner: c.label }));
                    break;
                case FORM_CONTROL_TYPE.NUMBER:
                    this.createLabel(c, appendTo);
                    const numInput = domCreate('input', { classList: ['form-control', 'form-control-number']}, appendTo);
                    numInput.type = 'number';
                    numInput.name = numInput.id = c.property;
                    if (c.min || c.min === 0) numInput.min = '' + c.min;
                    if (c.max || c.max === 0) numInput.max = '' + c.max;
                    if (c.step) numInput.step = '' + c.step;
                    break;
                case FORM_CONTROL_TYPE.TEXT:
                    this.createLabel(c, appendTo);
                    const textInput = domCreate('input', { classList: ['form-control', 'form-control-text']}, appendTo);
                    textInput.type = 'text';
                    textInput.name = textInput.id = c.property;
                    break;
                case FORM_CONTROL_TYPE.SELECT:
                    this.createLabel(c, appendTo);
                    const select = domCreate('select', { classList: ['form-control', 'form-control-select']}, appendTo);
                    select.name = select.id = c.property;
                    const option = domCreate('option', { value: '' }, select);
                    option.disabled = option.selected = option.hidden = true;
                    c.options.forEach(o => domCreate('option', { value: String(o.value), inner: o.label }, select));
                    break;
                case FORM_CONTROL_TYPE.HIDDEN:
                    const hidden = domCreate('input', { classList: ['form-control', 'form-control-hidden']}, appendTo);
                    hidden.type = 'hidden';
                    hidden.name = hidden.id = c.property;
                    break;
                case FORM_CONTROL_TYPE.OBJECT:
                    const fieldset = domCreate('fieldset', { classList: ['form-control', 'form-control-fieldset']}, appendTo);
                    fieldset.name = fieldset.id = c.property;
                    if (c.controls?.length) this.generateControls(c.controls, fieldset, false);
                    break;
                default:
                    console.warn('unhandled FORM_CONTROl_TYPE', c.type);
            }
        })
    }

    private checkValidity() {
        const valid = this.form.checkValidity();
        if (!valid) {
            console.log('controls that are invalid', this.form.valid)
        }
        this.formValid.set(valid);
    }

    private createLabel(c: FormControl, appendTo: HTMLElement) {
        const prop = ('property' in c) ? c.property : '';
        const inner = c.label ?? prop;
        const e = domCreate('label', { classList: ['form-control-label'], inner,  }, appendTo);
        e.setAttribute('for', prop);
    }
}