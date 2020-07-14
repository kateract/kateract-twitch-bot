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
    }

    public Handle(parts: string[], channel: string, tags: ChatUserstate): void
    {
        console.log(tags);
        if (parts.length == 1) {
            this.AdvertiseCostream(channel)
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) 
            && parts.length > 1 && parts[1].toLowerCase() == "add") {
            this.AddCostreamers(parts);
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) && parts.length > 1 && parts[1].toLowerCase() == "clear") {
            this.ClearCostream();
        }
        else if ((tags.badges?.broadcaster == '1' || tags.mod) && parts.length > 1 && parts[1].toLowerCase() == "subscribe") {
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
        console.log(`${channel}[${this.primaryChannel}] - ${uri}`)
        this.client.say(channel, `Check out all the streamers here: ${uri}`).catch((err) => console.log(err));

    }

    private AddCostreamers(parts: string[]): void {
                    
        for (let i = 2; i < parts.length; i++) {
            if (parts[i].trim().length > 0) {
                this.streamers.push(parts[i]);
            }
        }
        this.db.push("/costreamers", this.streamers);
    }

    private ClearCostream(): void {
        this.streamers.splice(0,this.streamers.length);
        this.db.push("/costreamers", this.streamers);
    }

    private Subscribe(tags: ChatUserstate): void {
        if (!this.subscribing)
        {
            this.subscribing = true;
        }
        let curChans = this.client.getChannels()
        console.log(curChans);
        this.streamers.forEach(streamer => {
            if (!curChans.includes(`#${streamer}`))
            {
                this.client.join(streamer);
            }
        });
        this.corelay.AddSubscriber(tags.username)
    }

    private Unsubscribe(tags: ChatUserstate): void {
        this.corelay.RemoveSubscriber(tags.username);
        if (!this.corelay.AreSubscribers)
        {
            this.subscribing = false;
        }
        let curChans = this.client.getChannels()
        {
            curChans.forEach((chan) => {
                if(chan != `#${this.primaryChannel}`)
                {
                    this.client.part(chan);
                }
            });
        }
    }

    public IsSubscribing(): boolean {
        return this.subscribing;
    }
}