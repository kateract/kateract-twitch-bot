import { IChannel } from "./IChannel";

export interface IChatUser{
    Channel: IChannel;
    Username: string;
    Moderator: boolean;
    Broadcaster: boolean;
}