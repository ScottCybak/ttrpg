export enum FACE {
    TOP = 't',
    NORTH = 'n',
    SOUTH = 's',
    EAST = 'e',
    WEST = 'w',
}

export const faceLabels: {[key in FACE]: string} = {
    [FACE.TOP]: 'top',
    [FACE.NORTH]: 'north',
    [FACE.SOUTH]: 'south',
    [FACE.EAST]: 'east',
    [FACE.WEST]: 'west',
};