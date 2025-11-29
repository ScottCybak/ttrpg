export enum MOVEMENT {
    NORMAL = 'n',
    DIFFICULT = 'd',
    GREATER_DIFFICULT = 'gd',
    CLIMB = 'c',
    SWIM = 's',
}

export const movementLabels: {[key in MOVEMENT]: string } = {
    [MOVEMENT.NORMAL]: 'Normal',
    [MOVEMENT.DIFFICULT]: 'Difficult',
    [MOVEMENT.GREATER_DIFFICULT]: 'Greater Difficult',
    [MOVEMENT.CLIMB]: 'Climb',
    [MOVEMENT.SWIM]: 'Swim',
}

interface Movement {
    orthogonal: number;  // each tile uses THIS speed (so, normal = 5)
    diagonal?: [number, number]; // diagonol movement uses [0] speed the first time, [1] speed the 2nd time, repeating
    critBonus?: number; // if a player crits, represents the bonus movement distance
}

export const movement: {[key in MOVEMENT]: Movement} = {
    [MOVEMENT.NORMAL]: { orthogonal: 5, diagonal: [5, 10]},
    [MOVEMENT.DIFFICULT]: { orthogonal: 10, diagonal: [10, 15]},
    [MOVEMENT.GREATER_DIFFICULT]: { orthogonal: 15, diagonal: [15, 20]},
    [MOVEMENT.CLIMB]: { orthogonal: 20, critBonus: 5 },
    [MOVEMENT.SWIM]: { orthogonal: 10, critBonus: 5 },
}