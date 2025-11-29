import { MapConfig } from "./map-config";
import { NpcEntity } from "./npc-entity";
import { PlayerEntity } from "./player-entity";
import { RULE_SET } from "./rule-set";

export interface Campaign {
    ruleSet: RULE_SET;
    name: string;
    maps?: MapConfig[];
    players?: PlayerEntity[];
    npcs?: NpcEntity[];
}