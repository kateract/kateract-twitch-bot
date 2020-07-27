import { IChatService } from "./IChatService";
import { Observable, fromEvent, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { IMessage } from "./IMessage";
import { Client, Options, ChatUserstate } from "tmi.js";
import { TwitchMessage } from './TwitchMessage';

export class TwitchChatService implements IChatService
{
    private client: Client;
    public Platform: string = 'twitch'
    public Connected$: Subject<boolean> = new Subject<boolean>();
    public Connected: boolean

    constructor(options: Options) {
        this.client = Client(options);

        this.client.on("connected", (address: any, port: any) => {
            this.Connected = true;
            this.Connected$.next(true);
            console.log(`Connected to ${address}:${port} as ${this.client.getUsername()}`);
        });
        this.client.on("disconnected", (reason: string) => {
            this.Connected = false;
            this.Connected$.next(false);
            console.log(`disconnected from ${this.Platform}: ${reason}`)
        })
        this.MessageQueue = fromEvent<IMessage>(this.client, "message", 
            (channel: string, tags:ChatUserstate, message:string, self:boolean) =>
            { return new TwitchMessage({Platform: this.Platform, Channel: channel.substr(1)}, tags, message, self)});
        
        this.client.connect().catch((err: any) => console.log(err));
        
    }
    public MessageQueue: Observable<IMessage>;

    JoinChannel(channel: string){
        this.client.join(channel);
    }

    LeaveChannel(channel: string) {
        this.client.part(channel);
    }

    SendMessage(channel: string, message: string) {
        this.client.say(channel, message);
    }

    InChannel(channel:string):boolean {
        return this.client.getChannels().includes(`#${channel}`);
    }

    GetChannels(): Array<string> {
        let list = this.client.getChannels().map(c => c.substr(1));
        console.log(`twitch channel list: ${list.join(', ')}`)
        return list;
    }
    
}