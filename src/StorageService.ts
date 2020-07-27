import { JsonDB } from 'node-json-db';
import { Catalog } from './Catalog';
import { ICatalog } from './ICatalog';

export class StorageService {
    private static instance: StorageService;
    public static GetService(db: JsonDB){
        if (!this.instance) {
            this.instance = new StorageService(db);
        }
        return this.instance;
    }

    private constructor(private readonly db: JsonDB) {}
    private catalogs: Array<{name:string, catalog:any}> = new Array<{name:string, catalog: any}>();
    
    public GetCatalog<T, U>(name: string): ICatalog<T, U> {
        let cata = this.catalogs.find(c => c.name === name);
        if (!cata) {
            console.log(`catalog ${name} not loaded, retrieving...`);
            cata = {
                name: name,
                catalog: Catalog.GetCatalog<T, U>(name, this.db)
            }
            this.catalogs.push(cata);
        }
        console.log(cata);
        return cata.catalog;
    }

}