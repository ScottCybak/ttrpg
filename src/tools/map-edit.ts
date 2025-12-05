import { domCreate } from "domCreate";
import { ToolBase } from "./tool-base";
import { GmClient } from "gm-client";

export class MapEdit extends ToolBase<HTMLDivElement, any> {
    toolCssClass = 'map-edit';
    private previousMapWatcher!: () => void;

    private mapSelect = domCreate('select', {
        id: 'select-map',
        inner: '<option disabled selected hidden>Select a map</option>',
    });

    onGmClientChange(gmClient: GmClient) {
        
        if (this.gmClient !== gmClient) {
            console.log('change', gmClient);
            if (this.previousMapWatcher) this.previousMapWatcher();
        }

        this.previousMapWatcher = gmClient.maps.watch(maps => {
            const sel = this.mapSelect;
            [...sel.childNodes].forEach((c, idx) => {
                if (idx) sel.removeChild(c);
            });
            maps.forEach(map => {
                domCreate('option', {
                    value: map.id,
                    inner: map.name,
                }, sel);
            });
            const currentMap = gmClient.map.get();
            if (currentMap) {
                sel.value = currentMap.id;
            }
        });
    }


    override show(): void {
        super.show();

        // const e = this.element;
        let e = this.toolElement;
        if (!e) {
            e = this.toolElement = domCreate('div', {classList: [this.cssClass, 'gm-option-tool-map-edit'] }, this.element);
            const mapSelect = this.mapSelect;
            e.appendChild(mapSelect);
            const editMap = domCreate('button', { inner: 'Edit' }, e);
            const newMap = domCreate('button', {inner: 'New'}, e);    

            
            newMap.addEventListener('click', () => {
                this.gmClient?.createMap();
            });
            
            mapSelect.addEventListener('change', () => {
                this.gmClient.loadMapById(this.mapSelect.value);
            });
    
            editMap.addEventListener('click', () => {
                const map = this.gmClient.map.get();
                if (map) {
                    this.gmClient?.editMap(map);
                }
            });
            this.onGmClientChange(this.gmClient);
        } else if (!e.parentElement) {
            this.element.appendChild(e);
        }
    }
}