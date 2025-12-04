import { TileOptions } from "def/tile-options";
import { ToolBase } from "./tool-base";
import { domCreate } from "domCreate";
import { Tile } from "tile";
import { keyboardInput } from "keys-down";
import { Watched } from "watched";

/**
 * no, lets convert this to a left only click
 * and an input that, that can be increased with
 * [q] and [e].  clicking will increase to that
 * level
 */

export class Elevation extends ToolBase<HTMLElement, TileOptions['elevation']> {
    toolCssClass = 'elevation';

    private levelTile = new Watched<Tile | undefined>(undefined);
    private previousLevelTile: Tile | undefined = undefined;
    private inputElement = domCreate('input', { classList: ['elevation-input']});
    // private keypressListener = this.keyListener.bind(this);

    min = 0;
    max = 10;

    override show() {
        super.show();
        let e = this.toolElement;
        if (!e) {
            e = this.toolElement = domCreate('div', {classList: [this.cssClass, 'gm-option-tool-elevation']}, this.element);
            e.innerHTML = `
                <div><kbd>q</kbd> to increase</div>
                <div><kbd>e</kbd> to decrease</div>
            `;
            const input = this.inputElement;
            const { min, max } = this;
            input.type = 'number';
            input.min = `${min}`;
            input.max = `${max}`;
            input.step = '1';
            input.value = `${min}`;
            e.prepend(input);
            this.addListener(window, 'keypress', this.keyListener);

            this.levelTile.watch(tile => {
                const className = 'elevation-level';
                if (this.previousLevelTile) {
                    this.previousLevelTile.element.classList.remove(className)
                }
                if (tile) {
                    tile.element.classList.add(className);
                }
                this.previousLevelTile = tile;
            });
        } else if (!e.parentElement) {
            this.element.appendChild(e);
            this.addListener(window, 'keypress', this.keyListener);
        }
    }

    private keyListener(evt: KeyboardEvent) {
        const key = evt.key.toLowerCase();
        const { min, max, inputElement } = this;
        const current = +(inputElement.value ?? 0);
        let adjust = 0;
        if (key === 'q') {
            adjust--;
        } else if (key === 'e') {
            adjust++;
        }
        let adjusted = current + adjust;
        adjusted = Math.max(Math.min(max, adjusted), min);
        if (adjusted !== current) {
            inputElement.value = `${adjusted}`;
        }
    }

    get inputValue() {
        const i = this.inputElement;
        return i.checkValidity() ? +(this.inputElement.value ?? 0) : undefined;
    }

    hoverOverTile(tile: Tile) {
        const elevation = this.inputValue;
        if (elevation === undefined) return;// gtfo on bad value
        const o = tile.options.get();
        if (elevation !== o.elevation) {
            const newOptions = {
                ...o,
                elevation,
            };
            tile.options.set(newOptions);
        }
    }
}