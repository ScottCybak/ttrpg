import { domCreate } from "domCreate";

export enum ICON {
    CUBE = 'fa-cube',
    MOVE = 'fa-arrows-up-down-left-right',
    EYEDROPPER = 'fa-eye-dropper',
    ELEVATION = 'fa-arrows-down-up-across-line'
}

export class Icon {
    private readonly element = domCreate('i');
    private isDisabled = false;
    private onClickCallback!: () => void;

    constructor(
        icon: ICON,
        appendToElement: HTMLElement,
    ) {
        this.icon = icon;
        if (appendToElement) this.appendTo(appendToElement);
        this.element.addEventListener('click', (evt) => {
            if (this.isDisabled || !this.onClickCallback) return;
            this.onClickCallback?.();
        })
    }
    set icon(icon: ICON) {
        this.element.classList.add('fa', icon);
    }

    private appendTo(host: HTMLElement) {
        host.appendChild(this.element);
    }

    set disabled(disabled: boolean) {
        this.element.classList[disabled ? 'add' : 'remove']('disabled');
    }

    onClick(cb: () => void): this {
        this.onClickCallback = cb;
        return this;
    }
}
