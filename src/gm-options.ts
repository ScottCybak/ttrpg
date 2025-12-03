import { domCreate } from "domCreate";
import { GmClient } from "gm-client";
import { ICON, Icon } from "icon";
import { throttle } from "throttle";
import { TextureSelect } from "tools/texture-select";
import { ToolBase } from "tools/tool-base";
import { Watched } from "watched";

enum TOOLS {
    NONE = 0,
    TEXTURE_PAINT = 1 << 0,
};

class GmOptions {
    private _gmClient!: GmClient;
    private activeTool = new Watched<TOOLS>(TOOLS.NONE);
    private activeDragging = false;
    private tools: {
        textureSelect?: TextureSelect,
    } = {};
    
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
                    // check to see if we have the texture select
                    let ts = this.tools.textureSelect;
                    if (!ts) {
                        ts = this.tools.textureSelect = new TextureSelect(this.element);
                    }
                    ts.show();
                    break;
            }
        })

        window.addEventListener('keydown', (evt) => {
            if (evt.repeat) return;
            if (evt.key === 'Escape') {

                if (ToolBase.activePicker.get()) {
                    ToolBase.activePicker.set(false);
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
        if (ToolBase.activePicker.get() && tile) {
            switch (this.activeTool.get()) {
                case TOOLS.TEXTURE_PAINT:
                    this.tools.textureSelect?.select(tile);
                    break;
            }
        }
    }

    private onPointerMove(evt: PointerEvent) {
        if (this.activeDragging && !ToolBase.activePicker.get()) {
            const t = evt.target as HTMLElement;
            switch (this.activeTool.get()) {
                case TOOLS.TEXTURE_PAINT:
                    // we need to call something
                    // 
                    const tile = this.gmClient.tileMap.tileByElement(t);
                    if (tile) {
                        const o = tile.options.get();
                        const texture = this.tools.textureSelect?.value;
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
            if (!ToolBase.activePicker.get()) {
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
        this.tools.textureSelect?.disconnect();
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