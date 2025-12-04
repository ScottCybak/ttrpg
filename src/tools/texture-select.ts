import { domCreate } from "domCreate";
import { ToolBase } from "./tool-base";
import { TEXTURE, textureOptions } from "def/texture";
import { FACE } from "map-form";
import { Icon, ICON } from "icon";
import { Tile } from "tile";
import { TileOptions } from "def/tile-options";

export class TextureSelect extends ToolBase<HTMLFormElement, TileOptions['texture']> {

    toolCssClass = 'texture-select';

    override show() {
        super.show();
        let form = this.toolElement;
        if (!form) {
            const size = 64; // defines our width
            const half = size / 2;
            const diameter = (half * Math.sqrt(10)) * 2;
            const style = `width: ${size}px; height: ${size}px;`;
            const classList = ['gm-option-tool-texture-box'];
            const shift = (diameter - (size * 3)) / 2;
            const options = textureOptions.map(({value, label}) => `<option value="${value}">${label}</option>`).join('')

            // our host element
            form = this.toolElement = domCreate('form', {
                classList: [this.cssClass, 'gm-option-tool-texture'],
                style: `--o-diameter: ${diameter}px;`
            }, this.element);

            // each of the sides
            domCreate('div', {
                classList,
                style: `${style} top: ${shift}px`,
                inner: `<select name="${FACE.NORTH}">${options}</select>`,
            }, form);
            domCreate('div', {
                classList,
                style: `${style} left: ${shift}px;`,
                inner: `<select name="${FACE.WEST}">${options}</select>`,
            }, form);
            domCreate('div', {
                classList,
                style: `${style}`,
                inner: `<select name="${FACE.TOP}">${options}</select>`,
            }, form);
            domCreate('div', {
                classList,
                style: `${style} right: ${shift}px;`,
                inner: `<select name="${FACE.EAST}">${options}</select>`,
            }, form);
            domCreate('div', {
                classList,
                style: `${style} bottom: ${shift}px;`,
                inner: `<select name="${FACE.SOUTH}">${options}</select>`,
            }, form);

            // create an eyedropper
            const pickerBox = domCreate('div', {
                classList: ['gm-option-tool-picker'],
            }, form)
            // with an icon
            new Icon(ICON.EYEDROPPER, pickerBox).onClick(() => {
                const active = !ToolBase.activePicker.get();
                ToolBase.activePicker.set(active);
            });
            // watch the activePicker and style our doodad
            ToolBase.activePicker.watch(active => {
                pickerBox.classList[active ? 'add' : 'remove']('active');
            });

            // listen to form emitted changes, and tell it to clear the picker when the user interacts
            form.addEventListener('change', () => this.onTextureChange(true));

            // call it for the first time
            this.onTextureChange(false);
        } else if (!form.parentElement) {
            this.element.appendChild(form);
        }

        // force the picker off
        ToolBase.activePicker.set(false);
    }

    override tileClicked(tile: Tile) {
        const texture = tile.options.get()?.texture;
        if (texture) {
            Object.entries(texture)
                .forEach(([key, value]) => {
                    const e = this.toolElement.elements.namedItem(key);
                    if (e) {
                        (e as HTMLSelectElement).value = value;
                    } 
                });
            this.onTextureChange(true);
        }
    }

    private onTextureChange(clearPicker: boolean) {
        const value: TileOptions['texture'] = {};
        [...this.toolElement.elements].map(e => {
            const asSelect = e as HTMLSelectElement;
            if (asSelect.name) {
                value[asSelect.name as FACE] = asSelect.value as TEXTURE;
                if (e.parentElement) {
                    e.parentElement.style.backgroundImage = `var(--${asSelect.value})`;
                }
            }
        })
        if (Object.keys(value).length) {
            this.value = value;
        }
        if (clearPicker) {
            ToolBase.activePicker.set(false);
        }
    }
}