import { ChatUserstate, Client } from "tmi.js";
import { CostreamRelayHandler } from "./CostreamRelayHandler";
import { StorageService } from "./StorageService";
import { ICatalog } from "./ICatalog";
import { Streamer } from "./Streamer";

export class MultiStreamHandler
{
    private readonly streamers:ICatalog<string, Streamer>;
    public subscribing: boolean;
    public excludes: Array<string>;
    public members: ICatalog<string, Streamer>

    constructor(private readonly client: Client, 
        private readonly primaryChannel: string,
        private readonly corelay: CostreamRelayHandler  ,
        storage: StorageService) 
    {
        this.members = storage.GetCatalog('members');
        this.streamers = storage.GetCatalog<string, Streamer>('streamers');
        this.ResolveChannels();
    }

    public Handle(parts: string[], channel: string, tags: ChatUserstate): void
    {
        //console.log(tags);
        if (parts.length == 1) {
            this.AdvertiseCostream(channel)
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) 
            && parts.length > 1 && parts[1].toLowerCase() == "add") {
            this.AddCostreamers(parts);
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) 
            && parts.length > 1 && parts[1].toLowerCase() == "remove") {
            this.RemoveCostreamers(parts);
        }else if ((tags.badges?.broadcaster == '1' || tags.mod) 
            && parts.length > 1 && parts[1].toLowerCase() == "clear") {
            this.ClearCostream();
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) 
            && parts.length > 1 && parts[1].toLowerCase() == "subscribe") {
            this.Subscribe(tags)
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "unsubscribe") {
            this.Unsubscribe(tags);
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "exclude") {
            this.Exclude(channel, parts[2]);
        }
    }

    private AdvertiseCostream(channel: string): void {
        let uri: string = `https://multi.raredrop.co/t${this.primaryChannel}`;
        let list = this.members.ListElements()
        for (let i = 0; i < list.length; i++) {
            uri += `/t${list[i].data.Name}`;
        }
        this.client.say(channel, `Check out all the streamers here: ${uri}`).catch((err) => console.log(err));

    }

    private AddCostreamers(parts: string[]): void {
                    
        for (let i = 2; i < parts.length; i++) {
            if (parts[i].trim().length > 0 && !this.members.HasElement(parts[i])) {
                if (this.streamers.HasElement(parts[i])){
                    this.members.AddElement(parts[i], this.streamers.GetElement(parts[i]));
                } else {
                    let streamer = new Streamer();
                    streamer.Name = parts[i];
                    this.members.AddElement(streamer.Name, streamer);
                    this.streamers.AddElement(streamer.Name, streamer);
                }
            }
        }
        this.ResolveChannels();
    }

    private RemoveCostreamers(channels: string[]): void
    {
        channels.forEach(c => {
            this.members.RemoveElement(c);
        });
    
        this.ResolveChannels();
    }

    private ClearCostream(): void {
        this.members.Clear();
    }

    private Subscribe(tags: ChatUserstate): void {
        if (!this.subscribing)
        {
            this.subscribing = true;
        }
        this.corelay.AddSubscriber(tags.username)
    }

    private Unsubscribe(tags: ChatUserstate): void {
        this.corelay.RemoveSubscriber(tags.username);
        if (!this.corelay.AreSubscribers)
        {
            this.subscribing = false;
        }

    }

    public IsSubscribing(): boolean {
        return this.subscribing;
    }

    public ResolveChannels(): void {
        let channels = this.client.getChannels();
        let list = this.members.ListElements();
        list.filter(s => !channels.includes(`#${s.index}`))
            .map(c => this.client.join(c.index));
        channels.filter(c => !list.map(f => f.index).includes(c.substr(1)) && c !== `#${this.primaryChannel}`)
            .map(c => this.client.part(c));
    }
    
    public Exclude(channel: string, user: string)
    {
        let streamer = this.streamers.GetElement(channel);
        streamer.Excludes.push(user);
    }
}