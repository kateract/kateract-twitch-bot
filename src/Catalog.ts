import { JsonDB } from "node-json-db";
import { ICatalog } from "./ICatalog";

export class Catalog<T,U> implements ICatalog<T,U>{
    private constructor(private readonly db: JsonDB, 
        private elements: Array<{index: T, data: U}>, 
        private name: string) {}

    public static GetCatalog<T,U>(name:string, db: JsonDB): Catalog<T,U> {
        let elements: Array<{index: T, data: U}>;
        if (db.exists(name)) {
            let data = db.getData(name);
            if (data.elements) {
                elements = data.elements;
                return new Catalog<T, U>(db, elements, name);
            }
        }

    }

    public AddElement(index: T, data: U){
        this.elements.push({index, data});
        this.db.push(`${name}/elements[${index}]`, data);
        return index;
    }

    public RemoveElement(index: T):U{
        let data = this.elements.splice(this.elements.findIndex(e => e.index == index))
        this.db.delete(`${name}/elements[${index}]`);
        return data[0].data;
    }

    public ListElements():Array<{index:T, data:U}>
    {
        return this.elements;
    }

    public GetElement(index: T): U{
        return this.elements.find(e => e.index = index).data;
    }

    public Count(): number {
        return this.elements.length;
    }

    public HasElement(index: T): boolean {
        if(this.elements.find(e => e.index == index)) {
            return false;
        } else {
            return true;
        }
    }
    public Clear(): Array<{index: T, data: U}> {
        this.db.delete(`${name}/elements`);
        return this.elements.splice(0);
    }
}