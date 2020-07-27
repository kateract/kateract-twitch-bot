import { CostreamRelayHandler } from "./CostreamRelayHandler";
import { StorageService } from "../storage/StorageService";
import { ICatalog } from "../storage/ICatalog";
import { Streamer } from "../chat/Streamer";
import { ChatManager } from "../chat/ChatManager";
import { IChatUser } from "../chat/IChatUser";
import { IChannel } from "../chat/IChannel";

export class MultiStreamHandler
{
    private readonly streamers:ICatalog<IChannel, Streamer>;
    public subscribing: boolean;
    public excludes: Array<string>;
    public members: ICatalog<IChannel, Streamer>

    constructor(private readonly manager: ChatManager, 
        private readonly primaryChannel: IChannel,
        private readonly corelay: CostreamRelayHandler  ,
        storage: StorageService) 
    {
        this.members = storage.GetCatalog<IChannel, Streamer>('members');
        //console.log(this.members.ListElements());
        this.streamers = storage.GetCatalog<IChannel, Streamer>('streamers');
        this.manager.Connected$.subscribe(obs => this.ResolveChannels());
    }

    public Handle(parts: string[], channel: IChannel, user: IChatUser): void
    {
        if (parts.length == 1) {
            this.AdvertiseCostream(channel)
        }
        else if ((user.Broadcaster || user.Moderator) 
            && parts.length > 1 && parts[1].toLowerCase() == "add") {
            this.AddCostreamers(channel.Platform, parts);
        }
        else if ((user.Broadcaster || user.Moderator) 
            && parts.length > 1 && parts[1].toLowerCase() == "remove") {
            this.RemoveCostreamers(channel.Platform, parts);
        }else if ((user.Broadcaster || user.Moderator) 
            && parts.length > 1 && parts[1].toLowerCase() == "clear") {
            this.ClearCostream();
        }
        else if ((user.Broadcaster || user.Moderator) 
            && parts.length > 1 && parts[1].toLowerCase() == "subscribe") {
            this.Subscribe(channel.Platform, user)
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "unsubscribe") {
            this.Unsubscribe(channel.Platform, user);
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "exclude") {
            this.Exclude(channel, parts[2]);
        }
    }

    private AdvertiseCostream(channel: IChannel): void {
        let uri: string = `https://multi.raredrop.co/t${this.primaryChannel.Channel}`;
        let list = this.members.ListElements()
        for (let i = 0; i < list.length; i++) {
            uri += `/t${list[i].data.Name}`;
        }
        //console.log(`Advertising on ${channel.Platform}, in ${channel.Channel}: ${uri}`)
        this.manager.SendMessage(channel, `Check out all the streamers here: ${uri}`);

    }

    private AddCostreamers(platform: string, parts: string[]): void {
        //console.log(`Adding streamers on ${platform}: ${parts.slice(2).join(',')}`);
        for (let i = 2; i < parts.length; i++) {
            let chan: IChannel = {Platform: platform,Channel:parts[i]}
            //console.log(chan);
            if (parts[i].trim().length > 0 && !this.members.HasElement(chan)) {
                if (this.streamers.HasElement(chan) && this.streamers.GetElement(chan).Platform == platform){
                    this.members.AddElement(chan, this.streamers.GetElement(chan));
                    //console.log(this.members.ListElements())
                } else {
                    let streamer = new Streamer();
                    streamer.Name = parts[i];
                    streamer.Platform = platform;
                    this.members.AddElement({Platform: platform, Channel: streamer.Name}, streamer);
                    this.streamers.AddElement({Platform: platform, Channel: streamer.Name}, streamer);
                    //console.log(this.members.ListElements());
                }
            }
            else{
                //console.log(`${parts[i].trim()}`);
                //console.log(this.members.ListElements());
            }
        }
        this.ResolveChannels();
    }

    private RemoveCostreamers(platform: string, channels: string[]): void
    {
        channels.forEach(c => {

            this.members.RemoveElement({Platform: platform, Channel: c});
        });
    
        this.ResolveChannels();
    }

    private ClearCostream(): void {
        this.members.Clear();
        this.ResolveChannels();
    }

    private Subscribe(platform: string, user: IChatUser): void {
        if (!this.subscribing)
        {
            this.subscribing = true;
        }
        this.corelay.AddSubscriber(platform, user.Username)
    }

    private Unsubscribe(platform: string, user: IChatUser): void {
        this.corelay.RemoveSubscriber(platform, user.Username);
        if (!this.corelay.AreSubscribers)
        {
            this.subscribing = false;
        }

    }

    public IsSubscribing(): boolean {
        return this.subscribing;
    }

    public ResolveChannels(): void {
        
        let list = this.members.ListElements();
        let joined = this.manager.CurrentChannels();
        //console.log(`Resolving channels: proposed: ${list.map(l => l.index.Channel).join(',')}, current: ${joined}`)
        list.filter(s => !this.manager.InChannel(s.index))
            .map(c => this.manager.JoinChannel(c.index));
        this.manager.CurrentChannels()
            .filter(c => !list.map(f => f.index).includes(c) 
                && !(c.Channel === this.primaryChannel.Channel && c.Platform === this.primaryChannel.Platform))
            .map(c => this.manager.LeaveChannel(c));
    }
    
    public Exclude(channel: IChannel, user: string)
    {
        let streamer = this.streamers.GetElement(channel);
        streamer.Excludes.push(user);
    }
}

// class Channel implements IChannel {
//     constructor(platform: string, channel: string) {
//         this.Platform = platform;
//         this.Channel = channel;
//     }
//     Platform: string;
//     Channel: string;
//     public toString(): string {
//         return Channel.toString(this);
//     }
//     public static toString(channel:Channel): string
//     {
//         return `${channel.Platform}.${channel.Channel}`
//     }
// }