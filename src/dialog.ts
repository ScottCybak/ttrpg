import { FormControl } from "def/form";
import { domCreate } from "domCreate";
import { FormEditor } from "form-editor";

export interface DialogConfig {
    underlayClickClose?: boolean;
}

const defaultOptions: DialogConfig = {
    underlayClickClose: true,
}

export class Dialog<T extends Object> {
    private container = domCreate('div', { classList: ['dialog']});
    private underlay = domCreate('div', { classList: ['dialog-underlay'] }, this.container);
    private content = domCreate('div', { classList: ['dialog-content'] }, this.container);
    
    private form!: FormEditor<T>;

    constructor(private cfg: DialogConfig = { ...defaultOptions}) {
        if (cfg.underlayClickClose) {
            this.underlay.addEventListener('click', (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                this.close(undefined);
            });
        }
    }

    show(): this {
        // clamp ourself to the document.body
        if (!this.container.parentElement) {
            document.body.appendChild(this.container);
        }
        return this;
    }

    close(value: T | undefined) {
        this.container?.parentElement?.removeChild(this.container);
        if (this.onCloseCallback) {
            this.onCloseCallback(value);
        }
    }

    private onCloseCallback?: (value: T | undefined) => void;
    
    onClose(callback: (value: T | undefined) => void): this {
        this.onCloseCallback = callback;
        return this;
    }

    setValue(value: T) {
        const form = this.form;
        if (form) {
            form.setValue(value);
        }
    }

    fromForm(controls: FormControl[], value?: T): this {
        this.form = new FormEditor<T>(controls).appendTo(this.content);
        if (value) {
            this.setValue(value);
            this.form.onSubmit(v => this.close(v));
            this.form.onCancel(() => this.close(undefined))
        }
        return this;
    }
}