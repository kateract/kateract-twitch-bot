import { ChatManager } from "../chat/ChatManager";
import { IChannel } from "../chat/IChannel";
import { IChatUser } from "../chat/IChatUser";
import { ICatalog } from "../storage/ICatalog";
import { Streamer } from "../chat/Streamer";
import { StorageService } from "../storage/StorageService";

export class FriendCodeHandler
{
    private members: ICatalog<IChannel, Streamer>;
    private friendCodes: ICatalog<IChannel, string>;
    constructor(
        private readonly manager: ChatManager,
        private readonly storage: StorageService
        ) {
            this.members = this.storage.GetCatalog("members");
            this.friendCodes = this.storage.GetCatalog("friendCodes");
        }

    public Handle(parts: Array<string>, channel: IChannel, user :IChatUser)
    {
        if (parts.length == 1) {
            this.ShowFriendCodes(channel)
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "register") {
            this.RegisterFriendCode(channel, user, parts[2]);
        }
    }

    private ShowFriendCodes(channel: IChannel){
        
        let list = new Array<string>()
        this.members.ListElements().map(member =>{
            if (this.friendCodes.HasElement(member.index))
            {
                list.push(`${member.index.Channel}: ${this.friendCodes.GetElement(member.index)}`);
            }
        });
        let codes = `Add us on Switch: ${list.join(' | ')}`;
        this.manager.SendMessage(channel, codes)
    }

    public RegisterFriendCode(channel: IChannel, user: IChatUser, code: string)
    {
        let validCode = this.ValidateFriendCode(code);
        if (validCode.trim().length > 0)
        {
            this.friendCodes.AddElement(user.Channel, validCode);
        }
        else
        {
            this.manager.SendMessage(channel, "Invalid Friend Code");
        }

    }

    private ValidateFriendCode(code: string)
    {
        const re = /(?:SW-)?([0-9A-Za-z]{4})-?([0-9A-Za-z]{4})-?([0-9A-Za-z]{4})/;
        if(re.test(code))
        {
            let match = re.exec(code);
            return match.slice(1).join('-');
        } else {
            console.log(`invalid friend code`)
            return "";
        }
    }
}
