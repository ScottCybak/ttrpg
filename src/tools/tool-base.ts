import { GmClient } from "gm-client";
import { Tile } from "tile";
import { Watched } from "watched";

export abstract class ToolBase<E extends HTMLElement, V> {

    static activePicker = new Watched(false);

    abstract toolCssClass: string;

    protected toolElement!: E;

    protected value!: V;

    protected readonly cssClass = 'gm-option-tool-dialog';

    protected readonly listeners: [target: Window | Element, name: string, fn: (...args: any[]) => void][] = [];

    private get bodyCssClass() {
        return `active-tool-${this.toolCssClass}`;
    }

    getValue() {
        return this.value;
    };

    tileClicked(tile: Tile) { }

    tileClickStart(tile: Tile) { }

    constructor(
        protected element: HTMLElement,
        protected gmClient: GmClient,
    ) {}

    gmClientChanged(gmClient: GmClient) {
        this.gmClient = gmClient;
    }

    addListener(target: Window | Element, name: string, fn: (...args: any[]) => void) {
        const boundFn = fn.bind(this);
        target.addEventListener(name, boundFn);
        this.listeners.push([
            target,
            name,
            boundFn,
        ]);
    }

    show() {
        document.body.classList.add('hide-entities', this.bodyCssClass);
    }

    disconnect() {
        this.toolElement?.parentElement?.removeChild(this.toolElement);
        document.body.classList.remove(this.bodyCssClass);
        this.listeners.forEach(([target, name, fn]) => target.removeEventListener(name, fn));
    }
}