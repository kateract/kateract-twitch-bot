import { ChatManager } from "../chat/ChatManager";

export class FriendCodeHandler
{
    constructor(private readonly manager: ChatManager) {}

    public RegisterFriendCode(username: string, friendcode: string): void {
        let friend = new FriendCode(username, friendcode);
    
    }

}

export class FriendCode{
    constructor(public Username: string, public Code: string ) {}
}