import { ENTITY_TYPE } from "def/entity-type";
import { PlayerEntity } from "def/player-entity";

export const players: PlayerEntity[] =  [
    {
        id: 'hemlock',
        name: 'Hemlock Sholmes',
        label: 'Hemlock',
        playedBy: 'scott',
        type: ENTITY_TYPE.PLAYER,
        thumbnail: 'img/players/hemlock-shomes.png',
        color: '#834A15',
        speed: 25,
    },
    {
        id: 'bohdi',
        name: 'Bohdi',
        playedBy: 'diana',
        type: ENTITY_TYPE.PLAYER,
        thumbnail: 'img/players/bohdi.png',
        color: '#60b8f3ff',
        speed: 25,
    },
    {
        id: 'ciela',
        name: 'Ciela',
        playedBy: 'matilda',
        type: ENTITY_TYPE.PLAYER,
        thumbnail: 'img/players/ciela.jpg',
        color: '#0c1747ff',
        speed: 25,
    },
    {
        id: 'beff',
        name: 'Beff',
        playedBy: 'kaitlyn',
        type: ENTITY_TYPE.PLAYER,
        thumbnail: 'img/players/beff.png',
        color: 'rgba(56, 105, 9, 1)',
        speed: 25,
    },
];