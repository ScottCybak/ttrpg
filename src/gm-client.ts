import { Campaign } from "def/campaign";
import { defaultMapConfig, MapConfig } from "def/map-config";
import { setDocumentTitle } from "def/rule-set";
import { Dialog } from "dialog";
import { domCreate } from "domCreate";
import { Entity } from "entity";
import { gmOptions } from "gm-options";
import { keyboardInput } from "keys-down";
import { mapForm } from "map-form";
import { throttle } from "throttle";
import { TileMap } from "tile-map";
import { Watched } from "watched";

export class GmClient {
    private element = domCreate('div', { id: 'gm-client' });
    readonly maps = new Watched<MapConfig[]>([]);
    readonly map = new Watched<MapConfig | undefined>(undefined);
    readonly campaign = new Watched<Campaign | undefined>(undefined);
    tileMap!: TileMap;

    private scale = new Watched(+(localStorage.getItem('scale') ?? 1));
    private windowWidth = new Watched(window.innerWidth);
    private windowHeight = new Watched(window.innerHeight);
    private positionX = new Watched(0);
    private positionY = new Watched(0);
    private maxX = 0;
    private maxY = 0;
    private moveMultiplier = 16;
    
    readonly playerEntities = new Map<string, Entity>();
    readonly npcEntities = new Map<string, Entity>();
    // readonly hideAll = new Watched(fa)

    constructor() {
        const root = document.getElementById('game-root');
        if (!root) throw 'unable to find root element';
        root.appendChild(this.element);

        gmOptions.gmClient = this;
        gmOptions.appendTo(root);
    }

    gameLoop() {
        const mult = this.moveMultiplier;
        let x = 0;
        let y = 0;
        if (keyboardInput.has('w')) y -= mult;
        if (keyboardInput.has('s')) y += mult;
        if (keyboardInput.has('a')) x -= mult;
        if (keyboardInput.has('d')) x += mult;
        const map = x || y ? this.map.get() : undefined;
        if (x) {
            const width = (map?.tileSizePx ?? 0) * (map?.columns ?? 0);
            const curX = this.positionX.get();
            this.positionX.set(Math.min(Math.max(curX + x, 0), width));
        }
        if (y) {
            const height = (map?.tileSizePx ?? 0) * (map?.rows ?? 0);
            const curY = this.positionY.get();
            this.positionY.set(Math.min(Math.max(curY + y, 0), height));
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    load(campaign: Campaign): this {
        this.campaign.set(campaign);
        
        setDocumentTitle(campaign);

        // bring in our playable characters, and store in our entity map
        campaign.players?.forEach(p => {
            this.playerEntities.set(p.id, new Entity(p));
        });
        campaign.npcs?.forEach(npc => {
            this.npcEntities.set(npc.id, new Entity(npc));
        });

        // TESTING ONLY
        const map = campaign.maps?.at(0);
        if (map) {
            console.warn('auto loading', map);
            this.loadMap(map);
            // setTimeout(() =>{
            //     this.editMap(map);
            // }, 200)
        }

        this.maps.set(campaign.maps ?? []);

        return this;
    }

    loadMapById(id: string) {
        const map = this.maps.get().find(m => m.id === id);
        if (map) {
            this.loadMap(map);
        }
    }

    loadMap(map: MapConfig) {
        const tileMap = this.tileMap = new TileMap(map, this).appendTo(this.element);
       
        this.map.set(map);
        this.maxX = map.columns * map.tileSizePx;
        this.maxY = map.rows * map.tileSizePx;
        this.element.style.setProperty('--perspective', map.perspective + 'px');

        this.positionX.set(this.maxX / 2);
        this.positionY.set(this.maxY / 2);

        this.createListeners(tileMap);
        requestAnimationFrame(this.gameLoop.bind(this));

        return this;
    }

    createMap() {
        return new Dialog<MapConfig>()
            .fromForm(mapForm, { ...defaultMapConfig})
            .show()
            .onClose(v => {
                if (v) {
                    this.saveMap(v);
                    this.loadMap(v);
                }
            });
    }

    editMap(map: MapConfig) {
        const loadMap = {
            ...defaultMapConfig,
            ...map,
            defaultTileData: {
                ...defaultMapConfig.defaultTileData,
                ...map.defaultTileData,
            },
        };
        new Dialog()
            .fromForm(mapForm, loadMap)
            .show()
            .onClose(m => {
                if (m) {
                    const mixed = {
                        ...loadMap,
                        ...m,
                    }
                    this.saveMap(mixed);
                    this.loadMap(mixed);
                }
            });
    }

    private saveMap(map: MapConfig) {
        const campaign = this.campaign.get();
        if (campaign) {
            const maps: MapConfig[] = campaign.maps ?? [];
            const existing = maps.findIndex(m => m.id === map.id);
            if (existing === -1) {
                maps.push(map);
            } else {
                maps.splice(existing, 1, map)
            }
            campaign.maps = maps;
            this.campaign.set(campaign);
        }
    }

    private createListeners(tileMap: TileMap) {
        const map = this.map.get();
        if (!map) return;
        const { zoomMin, zoomMax, zoomStep, zoomThrottle } = map;

        // window resize
        window.addEventListener('resize', throttle(evt => {
            this.windowWidth.set(window.innerWidth);
            this.windowHeight.set(window.innerHeight);
        }, 100));
        
        // mouse wheel scroll to zoom
        let scale = this.scale.get();
        window.addEventListener('wheel', throttle(evt => {
            evt.preventDefault();
            scale += (evt.deltaY > 0 ? -1 : 1) * (zoomStep ?? 0.05);
            scale = Math.round(Math.min(Math.max(scale, zoomMin ?? 0.4), zoomMax ?? 2) * 100) / 100;
            this.scale.set(scale);
        }, zoomThrottle ?? 1000 / 60 ), { passive: false });

        this.scale.watch(s => {
            const value = s ?? 1;
            localStorage.setItem('scale', '' + s);
            document.body.style.setProperty('--active-zoom', `${s}`)
        });

        
  
        // watch scaling, and positioning, and update the tileMap object
        Watched.combine(
            this.scale,
            this.windowWidth,
            this.windowHeight,
            this.positionX,
            this.positionY,
        ).watch(([scale, width, height, x, y]) => {
            requestAnimationFrame(() => {
                const posX = (width / 2) - x;
                const posY = (height / 2) - y;
                tileMap.transform = `
                    scale(${scale})
                    translateX(${posX}px)
                    translateY(${posY}px)
                `;
            })
        });
    }
}