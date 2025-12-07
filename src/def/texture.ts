export enum TEXTURE {
    GRASS_DRY = 'grass-dry',
    GRASS = 'grass',
    MUD = 'mud',
    WATER = 'water',
    LAVA = 'lava',
    ICE = 'ice',
    SNOW = 'snow',
}

export const textureLabels: {[key in TEXTURE]: string} = {
    [TEXTURE.GRASS]: 'Grass',
    [TEXTURE.GRASS_DRY]: 'Grass - Dry',
    [TEXTURE.MUD]: 'Mud',
    [TEXTURE.WATER]: 'Water',
    [TEXTURE.LAVA]: 'Lava',
    [TEXTURE.ICE]: 'Ice',
    [TEXTURE.SNOW]: 'Snow',
}

export const textureOptions = Object.entries(textureLabels).map(([value, label]) => ({ value, label }));