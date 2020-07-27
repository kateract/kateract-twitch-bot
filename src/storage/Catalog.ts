import { JsonDB } from "node-json-db";
import { ICatalog } from "./ICatalog";
import deepEqual from "deep-equal";

export class Catalog<T,U> implements ICatalog<T,U>{
    private constructor(private readonly db: JsonDB, 
        private elements: Array<{index: T, data: U}>, 
        private name: string) {}

    public static GetCatalog<T,U>(name:string, db: JsonDB): Catalog<T,U> {
        let elements: Array<{index: T, data: U}>;
        if (db.exists(`/${name}`)) {
            //console.log(`db for ${name} exists, loading...`)
            let data = db.getData(`/${name}`);
            if (data.elements) {
                
                elements = data.elements;
                //console.log(data);
            } 
            else 
            {
                //console.log(`data doesn't element:`)
                //console.log(data);
                elements = new Array<{index: T, data: U}>();
            }
            return new Catalog<T, U>(db, elements, name);
        } 
        else 
        {
            return new Catalog<T,U>(db, new Array<{index: T, data: U}>(), name);
        }

    }

    public AddElement(index: T, data: U){
        let idx = this.FindDataPointIndex(index)
        if (idx >= 0) {
            let test:boolean = deepEqual(this.elements[idx].data, data);
            if(test) {
                return this.elements[idx].index;
            }
        }
        let pos = this.elements.push({index, data}) - 1;
        //console.log(this.name);
        let dp =  new DataPoint<T, U>(index, data);
        if (dp){
            this.db.push(`/${this.name}/elements[${pos}]`,dp);
        } else{ 
            //console.log(`${index}, ${data}`)
        }
        return index;
    }

    public RemoveElement(index: T):U{
        let pos = this.FindDataPointIndex(index)
        let data = this.elements.splice(pos, 1)
        this.db.delete(`/${this.name}/elements[${pos}]`);
        return data[0].data;
    }

    public ListElements():Array<{index:T, data:U}>
    {
        return this.elements;
    }

    public GetElement(index: T): U{
        return this.FindDataPoint(index).data;
    }

    public Count(): number {
        return this.elements.length;
    }

    public HasElement(index: T): boolean {
        //console.log(this.elements);
        if(this.FindDataPoint(index)) {
            return true;
        } else {
            return false;
        }
    }
    public Clear(): Array<{index: T, data: U}> {
        this.db.delete(`/${this.name}/elements`);
        return this.elements.splice(0, this.elements.length);
    }

    public UpdateElement(index: T, data: U)
    {
        let idx = this.FindDataPointIndex(index);
        if (idx >= 0) {
            this.elements[idx].data = data;
            this.db.push(`/${this.name}/elements[${idx}]`, this.elements[idx]);
        }
    }
    private FindDataPointIndex(index: T): number {
        return this.elements.findIndex(e => deepEqual(e.index, index))
    }
    private FindDataPoint(index: T): DataPoint<T,U>
    {
        return this.elements.find(e => deepEqual(e.index, index))
    }
}

class DataPoint<T, U>{
    constructor(public index:T, public data:U) {}
}