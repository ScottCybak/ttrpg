import { FACE } from "def/face";
import { TEXTURE } from "./texture";
import { MOVEMENT } from "./movement";

export interface TileOptions {
    elevation?: number;
    texture?: {[key in FACE]?: TEXTURE}/** textures */
    movement?: MOVEMENT;
}