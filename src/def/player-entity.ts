import { EntityOptions } from "./entity-options";
import { ENTITY_TYPE } from "./entity-type";

export interface PlayerEntity extends EntityOptions {
    type: ENTITY_TYPE.PLAYER;
    playedBy?: string; // not sure what to do with this yet
}