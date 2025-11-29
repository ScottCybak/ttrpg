import { domCreate } from "domCreate";
import { GmClient } from "gm-client";

class GmOptions {
    private _gmClient!: GmClient;
    
    private element = domCreate('div', {
        id: 'gm-options',
    });
    private mapOptions = domCreate('div', { id: 'gm-map-options', classList: ['gm-options-section'] }, this.element);

    private mapSelect = domCreate('select', {
        id: 'select-map',
        inner: '<option disabled selected hidden>Select a map</option>',
    }, this.mapOptions);
    private editMap = domCreate('button', {
        inner: 'Edit',
    }, this.mapOptions);
    private newMap = domCreate('button', {
        inner: 'New'
    }, this.mapOptions);

    constructor() {
        this.newMap.addEventListener('click', () => this.gmClient?.createMap());
        this.mapSelect.addEventListener('change', () => {
            this.gmClient.loadMapById(this.mapSelect.value);
        });
        this.editMap.addEventListener('click', () => {
            const map = this.gmClient.map.get();
            if (map) {
                this.gmClient?.editMap(map);
            }
        });
    }

    set gmClient(gmClient: GmClient) {
        if (this.gmClient !== gmClient) {
            this._gmClient = gmClient;
            this.initialize(gmClient);
        }
    }
    get gmClient() {
        return this._gmClient;
    }

    private initialize(gm: GmClient) {
        // ok, so what now?
        // console.log('initialize', gm);
        // gm.campaign.watch(c => {
        //     if (!c) {
        //         this.cleanup();
        //         return;
        //     }
        //     console.log('loaded campaign', c);
        // })

        gm.maps.watch(maps => {
            const sel = this.mapSelect;
            sel.childNodes.forEach((c, idx) => {
                if (idx) sel.removeChild(c);
            });
            maps.forEach(map => {
                domCreate('option', {
                    value: map.id,
                    inner: map.name,
                }, sel);
            });
            const currentMap = gm.map.get();
            if (currentMap) {
                sel.value = currentMap.id;
            }
        });

        gm.map.watch(map => this.mapSelect.disabled = !!map);
    }

    appendTo(element: HTMLElement) {
        element.appendChild(this.element);
        return this;
    }

    private cleanup() {
        // todo
    }
}

// this is a singleton
export const gmOptions = new GmOptions();