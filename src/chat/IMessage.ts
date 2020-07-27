import { IChatUser } from "./IChatUser";
import { IChannel } from "./IChannel";

export interface IMessage{
    Channel: IChannel;
    User: IChatUser;
    Message: string;
    Self: boolean;
}