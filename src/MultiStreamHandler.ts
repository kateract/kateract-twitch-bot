import { ChatUserstate, Client } from "tmi.js";
import { JsonDB } from "node-json-db";
import { CostreamRelayHandler } from "./CostreamRelayHandler";

export class MultiStreamHandler
{
    private readonly streamers: Array<string>;
    public subscribing: boolean;

    constructor(private readonly client: Client, 
        private readonly db: JsonDB, 
        private readonly primaryChannel: string,
        private readonly corelay: CostreamRelayHandler) 
    {
        try {
            this.streamers = db.getData("/costreamers");
        } catch {
            this.streamers = new Array<string>();
        }
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
            && parts.length > 1 && parts[1].toLowerCase() == "add") {
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
    }

    private AdvertiseCostream(channel: string): void {
        let uri: string = `https://multi.raredrop.co/t${this.primaryChannel}`;
        for (let i = 0; i < this.streamers.length; i++) {
            uri += `/t${this.streamers[i]}`;
        }
        this.client.say(channel, `Check out all the streamers here: ${uri}`).catch((err) => console.log(err));

    }

    private AddCostreamers(parts: string[]): void {
                    
        for (let i = 2; i < parts.length; i++) {
            if (parts[i].trim().length > 0 && !this.streamers.includes(parts[i])) {
                this.streamers.push(parts[i]);
            }
        }
        this.db.push("/costreamers", this.streamers);
        this.ResolveChannels();
    }

    private RemoveCostreamers(channels: string[]): void
    {
        channels.forEach(c => {
            this.streamers.splice(this.streamers.indexOf(c), 1);
        });
    
        this.ResolveChannels();
    }

    private ClearCostream(): void {
        this.streamers.splice(0,this.streamers.length);
        this.db.push("/costreamers", this.streamers);
        this.ResolveChannels();
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
        this.streamers.filter(s => !channels.includes(`#${s}`))
            .map(c => this.client.join(c));
        channels.filter(c => !this.streamers.includes(c.substring(1)) && c !== `#${this.primaryChannel}`)
            .map(c => this.client.part(c));
    }
    
}