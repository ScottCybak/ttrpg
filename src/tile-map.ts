import { FACE } from "def/face";
import { MapConfig, MapNpc, MapPlayer } from "def/map-config";
import { TEXTURE } from "def/texture";
import { TileData } from "def/tile-data";
import { TileOptions } from "def/tile-options";
import { domCreate } from "domCreate";
import { GmClient } from "gm-client";
import { throttle } from "throttle";
import { Tile } from "tile";
import { Watched } from "watched";

export class TileMap {

    private readonly element = domCreate('div', { id: 'map' });
    private readonly tiles: Tile[][] = [];
    private readonly rows = new Watched(0);
    private readonly columns = new Watched(0);
    private readonly tileSizePx = new Watched(128);
    private readonly elevationStepPx = new Watched(0);
    private readonly tileData = new Watched<TileData>({});
    private readonly defaultTileData = new Watched<TileOptions>({});
    private readonly players = new Watched<MapPlayer[]>([]);
    private readonly npcs = new Watched<MapNpc[]>([]);
    private readonly maxTileHeight = new Watched(0);

    private lastTile: Tile | undefined = undefined;

    constructor(
        config: MapConfig,
        private client: GmClient,
    ) {
        const e = this.element;
        
        this.rows.set(config.rows);
        this.columns.set(config.columns);
        this.tileSizePx.set(config.tileSizePx);
        this.tileData.set(config.tileData ?? {})
        this.defaultTileData.set(config.defaultTileData ?? {});
        this.elevationStepPx.set(config.elevationStepPx);
        this.players.set(config.players ?? []);
        this.npcs.set(config.npcs ?? []);

        Watched.combine(
            this.tileSizePx,
            this.rows,
            this.columns,
            this.tileData,
            this.defaultTileData,
            this.elevationStepPx,
        ).watch(([size, rows, cols, tileData, def, elv]) => {
            this.destroyTiles();    
            const tiles = this.tiles;
            for (let r = 0; r < rows; r++) {
                const row: Tile[] = [];
                for (let c = 0; c < cols; c++) {
                    const id = this.tileId(r, c);
                    const data = {
                        ...def,
                        ...tileData[id]
                    };
                    const tile = new Tile(r, c, size, elv, data).appendTo(e);
                    row.push(tile);
                }
                tiles.push(row);
            };
            // run through our tiles and find the maxElevation
            this.maxTileHeight.set(Math.max(...tiles.flat(2).map(t => t.totalElevation)));
        });

        Watched.combine(
            this.players,
            this.maxTileHeight,
        ).watch(([players, maxTileHeight]) => {
            players.forEach(({id, position}) => {
                const entity = this.client.playerEntities.get(id);
                if (entity) {
                    const onTile = this.tileByRowColumn(position?.[0], position?.[1])
                    if (onTile) {
                        entity.moveToTile(onTile, this.element, maxTileHeight);
                    }
                }
            })
        });

        Watched.combine(
            this.npcs,
            this.maxTileHeight,
        ).watch(([npcs, maxTileHeight]) => {
            npcs.forEach(({id, position}) => {
                const entity = this.client.npcEntities.get(id);
                if (entity) {
                    const onTile = this.tileByRowColumn(position?.[0], position?.[1]);
                    if (onTile) {
                        entity.moveToTile(onTile, this.element, maxTileHeight);
                    }
                }
            })
        });

        this.element.addEventListener('pointermove', throttle(evt => this.onTileOver(evt), 16.67));
    }

    set transform(transform: string) {
        this.element.style.transform = transform;
    }

    appendTo(element: HTMLElement): this {
        element.appendChild(this.element);
        return this;
    }

    private onTileOver(evt: PointerEvent) {
        const tile = this.tileByElement(evt.target as HTMLElement);
        if (tile !== this.lastTile) {
            if (this.lastTile) this.lastTile.hovering.set(false);
            if (tile) tile.hovering.set(true);
            this.lastTile = tile;
        }
    }

    private tileId(row: number, column: number): string {
        return `${row}-${column}`;
    }

    private destroyTiles() {
        this.tiles.flat(2).forEach(tile => tile.destroy());
        this.tiles.length = 0;
    }

    tileByElement(element: HTMLElement) {
        const tileElement =  element.closest('.tile');
        return this.tiles.flat(2).find(t => t.element === tileElement);
    }

    private tileByRowColumn(row?: number, column?: number) {
        if (row === undefined || column === undefined) return;
        return this.tiles[row][column];
    }
}