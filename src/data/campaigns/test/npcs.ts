import { ENTITY_TYPE } from "def/entity-type";
import { NpcEntity } from "def/npc-entity";

export const npcs: NpcEntity[] = [
    {
        id: 'rat',
        name: 'Rat',
        thumbnail: 'img/npc/rat.png',
        speed: 25,
    },
    {
        id: 'skelly-boy',
        name: 'Skellington',
        thumbnail: 'img/npc/skellington.png',
        speed: 30,
    }
].map(e => ({
    size: 1, // standard size
    hostile: ENTITY_TYPE.PLAYER, // default them all to hostile to the player gb
    ...e,
    type: ENTITY_TYPE.NPC,
}));