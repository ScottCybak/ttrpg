import { FACE } from "def/face";
import { TEXTURE, textureOptions } from "def/texture";
import { TileData } from "def/tile-data";
import { TileOptions } from "def/tile-options";
import { domCreate } from "domCreate";
import { GmClient } from "gm-client";
import { ICON, Icon } from "icon";
import { throttle } from "throttle";
import { Tile } from "tile";
import { Watched } from "watched";

enum TOOLS {
    NONE = 0,
    TEXTURE_PAINT = 1 << 0,
};

class GmOptions {
    private _gmClient!: GmClient;
    private activeTool = new Watched<TOOLS>(TOOLS.NONE);
    private activePicker = new Watched(false);
    private activeDragging = false;
    private values: {
        textureSelect?: TileOptions['texture'],
    } = {}
    
    private element = domCreate('div', {
        id: 'gm-options',
    });
    private textureSelectElement!: HTMLFormElement;

    // Map
    private mapOptions = domCreate('div', { id: 'gm-map-options', classList: ['gm-options-section'] }, this.element);
    private mapSelect = domCreate('select', {
        id: 'select-map',
        inner: '<option disabled selected hidden>Select a map</option>',
    }, this.mapOptions);
    private editMap = domCreate('button', {
        inner: 'Edit',
    }, this.mapOptions);
    private newMap = domCreate('button', {
        inner: 'New'
    }, this.mapOptions);

    constructor() {
        this.newMap.addEventListener('click', () => {
            this.activeTool.set(TOOLS.NONE);
            this.gmClient?.createMap();
        });
        
        this.mapSelect.addEventListener('change', () => {
            this.gmClient.loadMapById(this.mapSelect.value);
        });

        this.editMap.addEventListener('click', () => {
            this.activeTool.set(TOOLS.NONE);
            const map = this.gmClient.map.get();
            if (map) {
                this.gmClient?.editMap(map);
            }
        });

        this.create();

        // watch our active tool and highlight the active one?
        // should this be moved out?
        this.activeTool.watch(active => {
            document.body.style.setProperty('--active-tool', '' + active);
            switch (active) {
                case TOOLS.NONE:
                    this.hideAllTools();
                    document.body.classList.remove('hide-entities');
                    break;
                case TOOLS.TEXTURE_PAINT:
                    this.showTextureSelect();
                    document.body.classList.add('hide-entities');
                    break;
            }
        })

        window.addEventListener('keydown', (evt) => {
            if (evt.repeat) return;
            if (evt.key === 'Escape') {

                if (this.activePicker.get()) {
                    this.activePicker.set(false);
                } else if (this.activeTool.get()) {
                    this.activeTool.set(TOOLS.NONE);
                }
            }
        });

        window.addEventListener('pointerdown', evt => this.onPointerDown(evt));
        window.addEventListener('pointerup', evt => this.onPointerUp(evt));
        window.addEventListener('pointermove', throttle(evt => this.onPointerMove(evt), 100));
        window.addEventListener('pointercancel', evt => this.onPointerCancel(evt));
        window.addEventListener('click', evt => this.onPointerClick(evt));
    }

    private onPointerUp(evt: PointerEvent) {
        this.onPointerCancel(evt);
    }

    private onPointerClick(evt: PointerEvent) {
        // what tile did we click on?
        const t = evt.target as HTMLElement;
        const tile = this.gmClient.tileMap.tileByElement(t);
        if (this.activePicker.get() && tile) {
            switch (this.activeTool.get()) {
                case TOOLS.TEXTURE_PAINT:
                    this.textureSelectPick(tile);
                    break;
            }
        }
    }

    private onPointerMove(evt: PointerEvent) {
        if (this.activeDragging && !this.activePicker.get()) {
            const t = evt.target as HTMLElement;
            switch (this.activeTool.get()) {
                case TOOLS.TEXTURE_PAINT:
                    const tile = this.gmClient.tileMap.tileByElement(t);
                    if (tile) {
                        const o = tile.options.get();
                        const texture = this.values.textureSelect;
                        tile.options.set({
                            ...o,
                            texture,
                        });
                    }
                    break;
            }
        }
    }

    private onPointerDown(evt: PointerEvent) {
        if (this.activeTool.get()) {
            if (!this.activePicker.get()) {
                console.warn('tell the gm client to hide markers?s')
                this.activeDragging = true;
                this.onPointerMove(evt);
            }
        }
    }

    private onPointerCancel(evt: PointerEvent) {
        this.activeDragging = false;
    }

    private hideAllTools() {
        // this.textureSelectElement?.classList.add('hidden');
        // rmeove it from the dom
        this.textureSelectElement?.parentElement?.removeChild(this.textureSelectElement);
    }

    private showTextureSelect() {
        let form = this.textureSelectElement;
        if (!form) {
            const size = 64; // defines our width
            const half = size / 2;
            const diameter = (half * Math.sqrt(10)) * 2;
            const style = `width: ${size}px; height: ${size}px;`;
            const classList = ['gm-option-tool-texture-box'];
            const shift = (diameter - (size * 3)) / 2;
            const options = textureOptions.map(({value, label}) => `<option value="${value}">${label}</option>`).join('')

            // our host element
            form = this.textureSelectElement = domCreate('form', {
                classList: ['gm-option-tool-texture'],
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
                const active = !this.activePicker.get();
                this.activePicker.set(active);
            });
            // watch the activePicker and style our doodad
            this.activePicker.watch(active => {
                pickerBox.classList[active ? 'add' : 'remove']('active');
            });

            // listen to form changes and update the
            form.addEventListener('change', this.onTextureChange.bind(this));
            this.onTextureChange();
        } else if (!form.parentElement) {
            this.element.appendChild(form);
        }
        // force the picker off
        this.activePicker.set(false);
    }

    private textureSelectPick(tile: Tile) {
        const texture = tile.options.get()?.texture;
        if (texture) {
            Object.entries(texture)
                .forEach(([key, value]) => {
                    const e = this.textureSelectElement.elements.namedItem(key);
                    if (e) {
                        (e as HTMLSelectElement).value = value;
                    } 
                });
            this.onTextureChange();
        }
    }

    private onTextureChange() {
        const value: TileOptions['texture'] = {};
        [...this.textureSelectElement.elements].map(e => {
            const asSelect = e as HTMLSelectElement;
            if (asSelect.name) {
                value[asSelect.name as FACE] = asSelect.value as TEXTURE;
                if (e.parentElement) {
                    e.parentElement.style.backgroundImage = `var(--${asSelect.value})`;
                }
            }
        })
        if (Object.keys(value).length) {
            this.values.textureSelect = value;
        }
    }

    create() {
        const tileOptionsSection = domCreate('div', { classList: ['gm-options-section']}, this.element);
        ([
            [TOOLS.NONE, ICON.MOVE], // this needs to be NONE, so our move watcher is disabled
            [TOOLS.TEXTURE_PAINT, ICON.CUBE],
        ] as [TOOLS, ICON][]).forEach(([tool, icon]) => this.createToolAction(tool, icon, tileOptionsSection))
    }

    private createToolAction(tool: TOOLS, icon: ICON, element: HTMLElement) {
        const container = domCreate('div', {
            classList: ['gm-option-tool'],
        }, element);
        const i = new Icon(icon, container).onClick(() => {
            console.log('active set', tool);
            this.activeTool.set(tool);
        });
        this.activeTool.watch(a => container.classList[a === tool ? 'add' : 'remove']('active'))
    }

    set gmClient(gmClient: GmClient) {
        if (this.gmClient !== gmClient) {
            this._gmClient = gmClient;
            this.initialize(gmClient);
        }
    }
    get gmClient() {
        return this._gmClient;
    }

    private initialize(gm: GmClient) {
        gm.maps.watch(maps => {
            const sel = this.mapSelect;
            sel.childNodes.forEach((c, idx) => {
                if (idx) sel.removeChild(c);
            });
            maps.forEach(map => {
                domCreate('option', {
                    value: map.id,
                    inner: map.name,
                }, sel);
            });
            const currentMap = gm.map.get();
            if (currentMap) {
                sel.value = currentMap.id;
            }
        });

        gm.map.watch(map => this.mapSelect.disabled = !!map);
    }

    appendTo(element: HTMLElement) {
        element.appendChild(this.element);
        return this;
    }

    private cleanup() {
        // todo
    }
}

// this is a singleton
export const gmOptions = new GmOptions();