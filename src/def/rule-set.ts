import { Campaign } from "./campaign"

export enum RULE_SET {
    PATHFINDER = 'pathfinder',
}

const ruleSetLabel: {[key in RULE_SET]: string } = {
    [RULE_SET.PATHFINDER]: 'Pathfinder2eRM',
}

export const setDocumentTitle = (campaign: Campaign): void => {
    const { ruleSet, name } = campaign;
    const label = ruleSetLabel[ruleSet];
    document.title = `${name} - ${label}`;
}