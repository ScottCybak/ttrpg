import { ENTITY_TYPE } from "def/entity-type";
import { NpcEntity } from "def/npc-entity";
import { PlayerEntity } from "def/player-entity";
import { domCreate } from "domCreate";
import { RectangularPrism } from "rectangular-prism";
import { Tile } from "tile";
import { Watched } from "watched";

export class Entity {
    private readonly element = domCreate('div', { classList: ['entity']});

    private tile: Tile | undefined = undefined;
    private tileWatcher!: () => void;
    private hostElement!: HTMLElement;
    private pole!: RectangularPrism;
    private poleHeight = 0;
    private floater!: HTMLElement;
    private hostile = new Watched<ENTITY_TYPE>(ENTITY_TYPE.NONE);

    constructor(
        private data: NpcEntity | PlayerEntity,
    ) {
        const e = this.element;
        if (data.type === ENTITY_TYPE.NPC && data.hostile) {
            this.hostile.set(data.hostile);
        }
        this.create();

        this.hostile.watch(h => {
            const hostileToPlayer = h & ENTITY_TYPE.PLAYER;
            this.element.classList[hostileToPlayer ? 'add' : 'remove']('hostile');
        })
    }

    set maxTileHeight(max: number) {
        if (max !== this.poleHeight) {
            this.pole.depth = max;
            this.poleHeight = max;// 
            this.floater.style.transform = `translateZ(calc(${max}px - var(--elevation)))`;
            // do we have an offset from the base?
        }   
    }

    moveToTile(tile: Tile, hostElement: HTMLElement, maxTileHeight: number) {
        // cancel our previous watcher if the tile is different
        if (this.tile && this.tile !== tile) {
            this.tile = undefined;
            this.tileWatcher!();
        }

        // cascade down anything we may need
        this.maxTileHeight = maxTileHeight;

        if (tile) {
            // attach our tile watcher
            this.tileWatcher = tile.positionalData.watch(d => {
                if (d) {
                    const s = this.element.style;
                    s.left = d.left + 'px';
                    s.top = d.top + 'px';
                    s.width = d.width + 'px';
                    s.height = d.height + 'px';
                    s.transform = `translateZ(var(--elevation))`;
                    s.setProperty('--elevation', d.elevation + 'px');
                    if (d.elevation >= this.poleHeight) {
                        this.pole.element.classList.add('hide');
                    }
                }
            });

            if (hostElement && hostElement !== this.hostElement) {
                hostElement.appendChild(this.element);
                this.hostElement = hostElement;
            }
        }
    }

    private create() {
        const { thumbnail, color } = this.data;

        if (color) this.element.style.setProperty('--player-color', color);
        
        const disc = domCreate('div', {
            classList: ['entity-disc'],
        }, this.element);

        const pole = domCreate('div', {
            classList: ['entity-rod'],
        }, disc);
        
        this.pole = new RectangularPrism(pole, {
            width: 4,
            height: 4,
            depth: this.poleHeight,
        });

        // we need to spin up a box thats' above the pole
        const floater = this.floater = domCreate('div', {
            classList: ['entity-floater'],
        }, this.element);

        if (thumbnail) floater.style.backgroundImage = `url(${thumbnail})`;
    }
}