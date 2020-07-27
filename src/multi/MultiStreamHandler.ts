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
        this.streamers = storage.GetCatalog<IChannel, Streamer>('streamers');
        this.members = storage.GetCatalog<IChannel, Streamer>('members');
        this.AddPrimaryStreamer();
        this.members.ListElements().forEach(m => {
            if(m.data.Excludes) {
                m.data.Excludes.forEach(e => this.corelay.AddExclude(e))
            }
        });
        //console.log(this.members.ListElements());
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
                let streamer: Streamer;
                if (this.streamers.HasElement(chan)){
                    streamer = this.streamers.GetElement(chan);
                    //console.log(this.members.ListElements())
                } else {
                    streamer = new Streamer();
                    streamer.Name = parts[i];
                    streamer.Platform = platform;
                    streamer.Excludes = new Array<string>();
                    this.streamers.AddElement({Platform: platform, Channel: streamer.Name}, streamer);
                    //console.log(this.members.ListElements());
                }
                this.members.AddElement(chan, this.streamers.GetElement(chan));
                if (streamer.Excludes) {
                    streamer.Excludes.forEach(e => this.corelay.AddExclude(e))
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
        this.AddPrimaryStreamer();
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
        //console.log(`Resolving channels: proposed: ${list.map(l => l.index.Channel).join(',')}, current: ${joined.map(j => j.Channel).join(',')}`)
        list.filter(s => !this.manager.InChannel(s.index))
            .map(c => this.manager.JoinChannel(c.index));
        joined.filter(c => !list.find(f => f.index.Platform === c.Platform && f.index.Channel === c.Channel))
            .map(c => this.manager.LeaveChannel(c));
    }
    
    public Exclude(channel: IChannel, user: string)
    {
        let streamer = this.streamers.GetElement(channel);
        if (!streamer.Excludes)
        {
            streamer.Excludes = new Array<string>();
        }
        if(!streamer.Excludes.includes(user)){
            streamer.Excludes.push(user);
        }
        this.streamers.UpdateElement(channel, streamer);
        this.corelay.AddExclude(user);
    }

    private AddPrimaryStreamer(): void {
        if (!this.streamers.HasElement(this.primaryChannel)){
            let s = new Streamer()
            s.Platform = this.primaryChannel.Platform;
            s.Name = this.primaryChannel.Channel;
            s.Excludes = new Array<string>();
            this.streamers.AddElement(this.primaryChannel, s);
        }
        if (!this.members.HasElement(this.primaryChannel)) {
            let primary =  this.streamers.GetElement(this.primaryChannel)
            this.members.AddElement(this.primaryChannel, primary);
            primary.Excludes.forEach(e => this.corelay.AddExclude(e));
        }
    }
}