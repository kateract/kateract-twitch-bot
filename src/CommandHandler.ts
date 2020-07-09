import { ChatUserstate, Client } from 'tmi.js';
import { MultiStreamHandler } from './MultiStreamHandler';
import { JsonDB } from 'node-json-db';
export class CommandHandler
{
    private readonly client: Client;
    private readonly multi: MultiStreamHandler;
    private readonly primaryChannel: string;
    private readonly db: JsonDB;

    constructor(client: Client, db: JsonDB, primaryChannel: string)
    {
        this.multi = new MultiStreamHandler(client, db, primaryChannel);
        this.primaryChannel = primaryChannel;
        this.client = client;
        this.db = db;
    }

    public ParseCommand(channel: string, tags: ChatUserstate, message: string): void
    {
        let parts = message.split(' ');
        if (parts[0] === "!multi") {
            this.multi.Handle(parts, channel, tags);
        }
        else if(parts[0] === "!so") {
            this.client.say(this.primaryChannel, `@${parts[1]} is kateract approved! Check them out at https://twitch.tv/${parts[1]}`);
        }
    }
}