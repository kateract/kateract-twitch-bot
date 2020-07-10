import { Client, ChatUserstate } from 'tmi.js';

export class CostreamRelayHandler 
{
    private readonly subscribers: Array<string>;

    constructor(private client: Client )
    {
        this.subscribers = new Array<string>()
    }

    public AddSubscriber(channel: string) : boolean
    {
        this.subscribers.push(channel);
        return this.subscribers.length > 0;
    }

    public RemoveSubscriber(channel: string)
    {
        this.subscribers.splice(this.subscribers.indexOf(channel),1);
    }

    public PushMessage(channel: string, tags: ChatUserstate, message: string)
    {
        this.subscribers.filter(s => s != channel).forEach(s => {
            this.client.say(s, `[${channel}]${tags.username} - ${message}`);
        });
    }
}