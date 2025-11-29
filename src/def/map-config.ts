import { FACE } from "./face";
import { MOVEMENT } from "./movement";
import { TEXTURE } from "./texture";
import { TileData } from "./tile-data";
import { TileOptions } from "./tile-options";

export interface MapPlayer {
    id: string;
    position?: [ number /* row */, number /* column */];
}

export interface MapNpc {
    id: string;
    position?: [number, number];
}

export interface MapConfig {
    id: string;
    name: string;
    perspective: number;
    rows: number;
    columns: number;
    tileSizePx: number;
    elevationStepPx: number;
    tileData?: TileData;
    zoomMax?: number;
    zoomMin?: number;
    zoomStep?: number;
    zoomThrottle?: number;
    defaultTileData?: TileOptions;
    players?: MapPlayer[];
    npcs?: MapNpc[];
}

export const defaultMapConfig: MapConfig = {
    id: '',
    name: '',
    perspective: 1200,
    rows: 25,
    columns: 40,
    tileSizePx: 64,
    elevationStepPx: 16,
    zoomMax: 1.5,
    zoomMin: 0.4,
    zoomStep: 0.05,
    zoomThrottle: 16,
    defaultTileData: {
        texture: {
            [FACE.TOP]: TEXTURE.GRASS,
            [FACE.NORTH]: TEXTURE.MUD,
            [FACE.SOUTH]: TEXTURE.MUD,
            [FACE.EAST]: TEXTURE.MUD,
            [FACE.WEST]: TEXTURE.MUD,
        },
        movement: MOVEMENT.NORMAL,
    }
}