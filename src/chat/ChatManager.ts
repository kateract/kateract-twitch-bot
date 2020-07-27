import { IChatService } from "../services/IChatService";
import { IMessage } from "./IMessage";
import { Observable, Subject, fromEvent, merge } from "rxjs";
import { mergeAll, sequenceEqual } from "rxjs/operators";
import { platform } from "os";
import { IChannel } from "./IChannel";

export class ChatManager
{
    private chatServices: Array<IChatService> = new Array<IChatService>();
    public Chats$: Subject<IMessage> = new Subject<IMessage>();
    public Connected$: Subject<string> = new Subject<string>();

    public AddChatService(service: IChatService)
    {
        if(!this.chatServices.find(s => s.Platform === service.Platform))
        {
            this.chatServices.push(service);
            service.MessageQueue.subscribe(msg => this.Chats$.next(msg));
            service.Connected$.subscribe(obs => {
                if(obs) {
                    this.Connected$.next(service.Platform);
                    //console.log(`connected to ${service.Platform}`)
                }
            })
        }
    }

    public JoinChannel(channel: IChannel){
        //console.log(`request to join ${channel.Channel} on ${channel.Platform}`)
        let service = this.chatServices.find(s => s.Platform == channel.Platform)
        if(service.Connected)
        {
            service.JoinChannel(channel.Channel);
        }
    }

    public LeaveChannel(channel: IChannel) {
        let service = this.chatServices.find(s => s.Platform == channel.Platform)
        if(service.Connected && service.InChannel(channel.Channel))
        {
            service.LeaveChannel(channel.Channel);
        }
    }

    public SendMessage(channel: IChannel, message: string): void{
        let service = this.chatServices.find(s => s.Platform == channel.Platform) 
        if(service.Connected && service.InChannel(channel.Channel))
        {
            service.SendMessage(channel.Channel, message);
        }
    }

    public InChannel(channel: IChannel): boolean {
        let service = this.chatServices.find(s=> s.Platform == channel.Platform);
        if (service.Connected)
        {
            return service.InChannel(channel.Channel);
        }
        else
        {
            console.log(`connection status for ${channel.Platform}: ${service.Connected}`)
        }
        return false;
    }

    public CurrentChannels(): Array<IChannel> {
        let list: Array<IChannel> = new Array<IChannel>();
        this.chatServices.map(s => list = list.concat(s.GetChannels().map(c => new Channel(s.Platform, c))));
        //console.log(`channel list: ${list.map(c => c.Channel).join(',')}`);
        return list;
    }
}

class Channel implements IChannel {
    constructor(platform: string, channel: string){
        this.Platform = platform;
        this.Channel = channel;
    }
    Platform: string;
    Channel: string;

}