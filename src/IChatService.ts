import { Observable, Subject } from 'rxjs';
import { IMessage } from './IMessage';

export interface IChatService
{
    Connected$: Subject<boolean>;
    Connected: boolean;
    Platform: string;
    MessageQueue: Observable<IMessage>;
    GetChannels(): Array<string>;
    JoinChannel(channel: string): void;
    LeaveChannel(channel: string): void;
    SendMessage(channel: string, message: string): void;
    InChannel(channel:string): boolean;
}