import { TileOptions } from "def/tile-options";
import { domCreate } from "domCreate";
import { GmClient } from "gm-client";
import { Icon } from "icon";
import { keyboardInput } from "keys-down";
import { throttle } from "throttle";
import { TOOL, tools, ValidTools } from "tools";
import { Elevation } from "tools/elevation";
import { ToolBase } from "tools/tool-base";
import { Watched } from "watched";


export class GmOptions {
    private _gmClient!: GmClient;
    private activeTool = new Watched<TOOL>(TOOL.NONE);
    private activeDragging = false;
    private tools: Partial<{[key in TOOL]: InstanceType<ValidTools>}> = {};
    
    private element = domCreate('div', {
        id: 'gm-options',
    });

    constructor() {
        this.create();

        // watch our active tool, hide things and create the instance of the this.tool
        // if it hasn't been so already
        this.activeTool.watch(active => {
            document.body.style.setProperty('--active-tool', '' + active);
            this.hideAllTools();
            if (active === TOOL.NONE) {
                document.body.classList.remove('hide-entities');
            } else {
                tools.filter(([tool]) => tool === active).forEach(([tool, icon, Klass]) => {
                    let control = this.tools[tool];
                    if (!control) {
                        control = this.tools[tool] = new Klass(this.element, this.gmClient);
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
        const element = this.element;
        const section = domCreate('div', { classList: ['gm-options-section']}, element);
        tools.forEach(([tool, icon, _, hotKey, title]) => {

            const container = domCreate('div', {
                classList: ['gm-option-tool'],
                title,
                dataset: {hotKey},
            }, section);
            const onClick = (() => {
                this.activeTool.set(tool);
            }).bind(this)
            const i = new Icon(icon, container).onClick(onClick);
            this.activeTool.watch(a => container.classList[a === tool ? 'add' : 'remove']('active'))
            if (hotKey) {
                keyboardInput.registerHotKey(hotKey, onClick);
            }
        });
    }

    set gmClient(gmClient: GmClient) {
        if (this.gmClient !== gmClient) {
            this._gmClient = gmClient;
            Object.values(this.tools).forEach(t => t.gmClientChanged(gmClient));
        }
    }
    get gmClient() {
        return this._gmClient;
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