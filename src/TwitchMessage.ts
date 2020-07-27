import { IMessage } from "./IMessage";
import { IChatUser } from "./IChatUser";
import { IChannel } from "./IChannel";
import { ChatUserstate } from "tmi.js";

export class TwitchMessage implements IMessage{
    Platform : string = "twitch";
    Channel: IChannel;
    User: IChatUser;
    Message : string;
    Self: boolean;
    constructor(channel: IChannel, tags: ChatUserstate, message: string, self: boolean)
    {
        this.Channel = channel;
        this.Message = message;
        this.Self = self;
        this.User = {
            Username: tags.username,
            Channel: channel,
            Moderator: tags.mod, 
            Broadcaster: tags.badges?.broadcaster == '1'
        }
    }
}