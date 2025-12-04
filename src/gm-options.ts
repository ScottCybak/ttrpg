import { TileOptions } from "def/tile-options";
import { domCreate } from "domCreate";
import { GmClient } from "gm-client";
import { ICON, Icon } from "icon";
import { throttle } from "throttle";
import { Elevation } from "tools/elevation";
import { TextureSelect } from "tools/texture-select";
import { ToolBase } from "tools/tool-base";
import { Watched } from "watched";

enum TOOL {
    NONE = 0,
    TEXTURE_PAINT = 1 << 0,
    ELEVATION = 1 << 1,
};

type ValidTools = typeof TextureSelect | typeof Elevation;

const validTools: [TOOL, ICON, ValidTools][] = [
    [TOOL.TEXTURE_PAINT, ICON.CUBE, TextureSelect],
    [TOOL.ELEVATION, ICON.ELEVATION, Elevation],
];

class GmOptions {
    private _gmClient!: GmClient;
    private activeTool = new Watched<TOOL>(TOOL.NONE);
    private activeDragging = false;
    private tools: Partial<{[key in TOOL]: InstanceType<ValidTools>}> = {};
    // private tools: {
    //     textureSelect?: TextureSelect,
    //     elevation?: Elevation,
    // } = {};
    
    private element = domCreate('div', {
        id: 'gm-options',
    });

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
            this.activeTool.set(TOOL.NONE);
            this.gmClient?.createMap();
        });
        
        this.mapSelect.addEventListener('change', () => {
            this.gmClient.loadMapById(this.mapSelect.value);
        });

        this.editMap.addEventListener('click', () => {
            this.activeTool.set(TOOL.NONE);
            const map = this.gmClient.map.get();
            if (map) {
                this.gmClient?.editMap(map);
            }
        });

        this.create();

        // watch our active tool, hide things and create the instance of the this.tool
        // if it hasn't been so already
        this.activeTool.watch(active => {
            document.body.style.setProperty('--active-tool', '' + active);
            this.hideAllTools();
            if (active === TOOL.NONE) {
                document.body.classList.remove('hide-entities');
            } else {
                validTools.filter(([tool]) => tool === active).forEach(([tool, icon, Klass]) => {
                    let control = this.tools[tool];
                    if (!control) {
                        control = this.tools[tool] = new Klass(this.element);
                    }
                    control.show();
                })
            }
        });

        window.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                if (ToolBase.activePicker.get()) {
                    ToolBase.activePicker.set(false);
                } else if (this.activeTool.get()) {
                    this.activeTool.set(TOOL.NONE);
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
        const t = evt.target as HTMLElement;
        const tile = this.gmClient.tileMap.tileByElement(t);
        if (ToolBase.activePicker.get() && tile) {
            const active = this.activeTool.get();
            this.tools[active]?.tileClicked(tile);
        }
    }

    private onPointerMove(evt: PointerEvent) {
        if (this.activeDragging && !ToolBase.activePicker.get()) {
            const t = evt.target as HTMLElement;
            const active = this.activeTool.get();
            const tool = this.tools[active];
            if (!tool || !active) return;
            // for now, handle these individually
            const tile = this.gmClient.tileMap.tileByElement(t);
            if (tile) {
                switch (active) {
                    case TOOL.TEXTURE_PAINT:
                        const o = tile.options.get();
                        const texture = tool.getValue() as TileOptions['texture'];
                        tile.options.set({
                            ...o,
                            texture,
                        });
                        break;
                    case TOOL.ELEVATION:
                        (tool as Elevation).hoverOverTile(tile);
                        break;
                }
            }
        }
    }

    private onPointerDown(evt: PointerEvent) {
        if (this.activeTool.get()) {
            if (!ToolBase.activePicker.get()) {
                this.activeDragging = true;
                this.onPointerMove(evt);
                const active = this.tools[this.activeTool.get()];
                const t = evt.target as HTMLElement;
                const tile = this.gmClient.tileMap.tileByElement(t);
                if (active && tile) {
                    active.tileClickStart(tile)
                }
            }
        }
    }

    private onPointerCancel(evt: PointerEvent) {
        this.activeDragging = false;
    }

    private hideAllTools() {
        Object.values(this.tools)
            .forEach(t => t.disconnect());
    }   

    create() {
        const tileOptionsSection = domCreate('div', { classList: ['gm-options-section']}, this.element);
        ([
            [TOOL.NONE, ICON.MOVE], // this needs to be NONE, so our move watcher is disabled
            [TOOL.TEXTURE_PAINT, ICON.CUBE],
            [TOOL.ELEVATION, ICON.ELEVATION],
        ] as [TOOL, ICON][]).forEach(([tool, icon]) => this.createToolAction(tool, icon, tileOptionsSection))
    }

    private createToolAction(tool: TOOL, icon: ICON, element: HTMLElement) {
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
            [...sel.childNodes].forEach((c, idx) => {
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