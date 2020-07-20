import { ChatUserstate, Client } from 'tmi.js';
import { MultiStreamHandler } from './MultiStreamHandler';
import { JsonDB } from 'node-json-db';
export class CommandHandler {
    private currentRoll: number;
    constructor(
        private readonly client: Client,
        db: JsonDB,
        private readonly primaryChannel: string,
        private readonly timeoutInterval: number,
        private readonly multi: MultiStreamHandler) {
        this.currentRoll = 0;
    }

    public ParseCommand(channel: string, tags: ChatUserstate, message: string): void {
        let parts = message.split(' ');
        if (parts[0] === "!multi") {
            this.multi.Handle(parts, channel, tags);
        }
    }

    public RollTimerChats(primaryChannel: string, rollChats: string[]): void {
        setTimeout(() =>{
            this.client.say(primaryChannel, rollChats[this.currentRoll]);
            this.currentRoll = (this.currentRoll + 1) % rollChats.length;
            this.RollTimerChats(primaryChannel, rollChats);
        }, this.timeoutInterval);
    }
}