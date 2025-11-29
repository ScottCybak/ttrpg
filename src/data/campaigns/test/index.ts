import { Campaign } from "def/campaign";
import { FACE } from "def/face";
import { MOVEMENT } from "def/movement";
import { RULE_SET } from "def/rule-set";
import { TEXTURE } from "def/texture";
import { players } from "./players";
import { random } from "random";
import { npcs } from "./npcs";

const water = { texture: { t: TEXTURE.WATER}, movement: MOVEMENT.SWIM };
const columns = 16;
const rows = 9;

export const testCampaign: Campaign = {
    ruleSet: RULE_SET.PATHFINDER,
    name: 'The Confusion',
    players: players,
    npcs: npcs,
    maps: [
        {
            id: '1',
            name: 'Field & Stream',
            players: players.map(p => ({id: p.id, position: [random(0, rows - 1), random(0, columns - 1)]})),
            npcs: npcs.map(npc => ({ id: npc.id, position: [random(0, rows - 1), random(0, columns - 1)]})),
            perspective: 1280,
            columns,
            rows,
            tileSizePx: 128,
            elevationStepPx: 32,
            zoomMin: 0.4,
            zoomMax: 1.5,
            zoomStep: 0.05,
            tileData: {
                '1-1':  { elevation: 1 },
                '7-12': { elevation: 2 },
                '7-13': { elevation: 2 },
                '8-13': { elevation: 2 },
                '0-7': water,
                '0-8': water,
                '0-9': water,
                '1-8': water,
                '1-9': water,
                '2-8': water,
                '3-8': water,
                '4-8': water,
                '5-8': water,
            },
            defaultTileData: {
                texture: {
                    [FACE.TOP]: TEXTURE.GRASS,
                    [FACE.EAST]: TEXTURE.MUD,
                    [FACE.WEST]: TEXTURE.MUD,
                    [FACE.NORTH]: TEXTURE.MUD,
                    [FACE.SOUTH]: TEXTURE.MUD,
                },
            }
        }
    ],
}

testCampaign.maps![0].players![0].position = [7, 13];