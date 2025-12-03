import { Watched } from "watched";

export abstract class ToolBase<E extends HTMLElement> {

    static activePicker = new Watched(false);

    protected toolElement!: E;

    constructor(
        protected element: HTMLElement) {
    }

    show() {
        document.body.classList.add('hide-entities');
    }

    disconnect() {
        this.toolElement?.parentElement?.removeChild(this.toolElement);
    }
}