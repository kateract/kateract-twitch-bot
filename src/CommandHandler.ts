import { ChatUserstate, Client } from 'tmi.js';
import { MultiStreamHandler } from './MultiStreamHandler';
import { JsonDB } from 'node-json-db';
export class CommandHandler
{
    private readonly multi: MultiStreamHandler;

    constructor(private readonly client: Client, 
        db: JsonDB, 
        private readonly primaryChannel: string)
    {
        this.multi = new MultiStreamHandler(client, db, primaryChannel);
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