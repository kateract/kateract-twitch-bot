export interface ICatalog<T,U>{
    AddElement(index:T, data:U): T;
    RemoveElement(index:T):U
    GetElement(index:T):U;
    ListElements():Array<{index: T, data: U }>
    Count():number;
    HasElement(index:T):boolean;
    UpdateElement(index: T, data: U): boolean;
    Clear():void;
}