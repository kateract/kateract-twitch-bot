import { ChatUserstate, Client } from "tmi.js";
import { JsonDB } from "node-json-db";

export class MultiStreamHandler
{
    private readonly db: JsonDB;
    private readonly streamers: Array<string>;
    private readonly primaryChannel: string;
    private readonly client: Client;
    private subscribing: boolean;

    constructor(client: Client, db: JsonDB, primaryChannel: string) {
        this.db = db;
        this.client = client;
        this.primaryChannel = primaryChannel;
        try {
            this.streamers = db.getData("/costreamers");
        } catch {
            this.streamers = new Array<string>();
        }
    }

    public Handle(parts: string[], channel: string, tags: ChatUserstate): void
    {
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
            this.Subscribe()
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "unsubscribe") {
            this.Unsubscribe();
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

    private Subscribe(): void {
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
    }

    private Unsubscribe(): void {
        if (this.subscribing)
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
}