import { domCreate } from "domCreate";
import { FACE } from "def/face";
import { TileOptions } from "def/tile-options";
import { Watched } from "watched";
import { RectangularPrism } from "rectangular-prism";

const optionalFaces = [FACE.NORTH, FACE.SOUTH, FACE.EAST, FACE.WEST];
interface PositionalData {
    left: number;
    top: number;
    width: number;
    height: number;
    elevation: number;
}

export class Tile {
    readonly element = domCreate('div', { classList: ['tile'] });

    row = new Watched(0);
    column = new Watched(0);
    tileSizePx = new Watched(0);
    readonly options = new Watched<TileOptions>({});
    elevationStepPx = new Watched(0);


    readonly hovering = new Watched(false);
    readonly positionalData = new Watched<PositionalData | undefined>(undefined);

    private rectangularPrism!: RectangularPrism;

    private listeners: (() => void)[] = [];
    
    constructor(
        row: number,
        column: number,
        tileSizePx: number,
        elevationStepPx: number,
        data: TileOptions,
    ) {
        // nothing sets these otherwise, so why pub?
        this.row.set(row);
        this.column.set(column);
        this.tileSizePx.set(tileSizePx);
        this.options.set(data);
        this.elevationStepPx.set(elevationStepPx);

        this.listeners.push(
            Watched
                .combine(this.row, this.column, this.tileSizePx, this.elevationStepPx, this.options)
                .watch(([r, c, s, e, opt]) => {
                    this.update(r, c, s, e, opt);
            }),
            this.hovering.watch(hovering => {
                requestAnimationFrame(() => {
                    this.element.classList[hovering ? 'add' : 'remove']('hovering');
                });
            }),
        );
    }

    appendTo(element: HTMLElement): this {
        element.appendChild(this.element);
        return this;
    }
    
    destroy() {
        this.rectangularPrism?.destroy();
        [ ...this.element.childNodes].forEach(n => this.element.removeChild(n));
        this.listeners.forEach(disco => disco());
        this.element.parentElement?.removeChild(this.element);
    }

    private update(row: number, column: number, tileSizePx: number, elevationStepPx: number, options: TileOptions) {
        const e = this.element;
        const left = column * tileSizePx;
        const top = row * tileSizePx;
        const width = tileSizePx;
        const height = tileSizePx;
        const depth = (options.elevation ?? 0) * elevationStepPx;

        this.rectangularPrism = new RectangularPrism(this.element, {width, height, depth }, options);

        // position it
        e.style.left = `${left}px`;
        e.style.top = `${top}px`;
        e.dataset.row = '' + row;
        e.dataset.column = '' + column;

        // handle our custom shared texture
        e.style.setProperty('--texture-x', left + 'px');
        e.style.setProperty('--texture-y', top + 'px');

        this.positionalData.set({
            left,
            top,
            width,
            height,
            elevation: depth,
        });
    } 

    isEnemyOccupying() {
        // run through all entities
        // const entities = this.e
    }
}

/**
 * // ok, we need to know what makes a Tile 'traversable'
 * 
 * npc players have a "hostile" stat.  if set to PLAYER, then they are hostile to player
 * 1. if an "enemy" is occupying it, it should return 0 (false)
 * 2. 
 * 
 */