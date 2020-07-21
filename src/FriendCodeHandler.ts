import { JsonDB } from "node-json-db";

export class FriendCodeHandler
{
    constructor(private readonly db: JsonDB) {}

    public RegisterFriendCode(username: string, friendcode: string): void {
        let friend = new FriendCode(username, friendcode);
    
    }

}

export class FriendCode{
    constructor(public Username: string, public Code: string ) {}
}