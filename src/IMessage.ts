import { IUser } from "./IUser";

export interface IMessage{
    Platform: string;
    Channel: string;
    User: IUser;
    Message: string;
}