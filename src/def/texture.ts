export enum TEXTURE {
    GRASS_DRY = 'grass-dry',
    GRASS = 'grass',
    MUD = 'mud',
    WATER = 'water',
}

export const textureLabels: {[key in TEXTURE]: string} = {
    [TEXTURE.GRASS]: 'Grass',
    [TEXTURE.GRASS_DRY]: 'Grass - Dry',
    [TEXTURE.MUD]: 'Mud',
    [TEXTURE.WATER]: 'Water',
}