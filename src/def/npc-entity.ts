import { EntityOptions } from "./entity-options";
import { ENTITY_TYPE } from "./entity-type";

export interface NpcEntity extends EntityOptions {
    type: ENTITY_TYPE.NPC;
    hostile?: ENTITY_TYPE;
}