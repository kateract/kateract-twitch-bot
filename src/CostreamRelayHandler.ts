import { Client, ChatUserstate } from 'tmi.js';

export class CostreamRelayHandler 
{
    private readonly subscribers: Array<string>;
    private readonly excludes: Array<string>;

    constructor(private client: Client )
    {
        this.subscribers = new Array<string>();
        this.excludes = new Array<string>();
    }

    public AddSubscriber(channel: string) : boolean
    {
        if (this.subscribers.indexOf(channel) < 0){
            this.subscribers.push(channel);
        }
        console.log(this.subscribers)
        return this.subscribers.length > 0;
    }

    public RemoveSubscriber(channel: string)
    {
        this.subscribers.splice(this.subscribers.indexOf(channel),1);
    }

    public PushMessage(channel: string, tags: ChatUserstate, message: string)
    {
        if(!(this.excludes.indexOf(tags.username) >= 0)){
            //console.log (`Message from ${channel}!`)
            this.subscribers.filter(s => `#${s}` !== channel).forEach(s => {
                //console.log(`relaying message from ${channel} to #${s}!`)
                this.client.say(s, `[${channel}] ${tags.username}: ${message}`);
            });
        }
    }

    public AreSubscribers(): boolean {
        return this.subscribers.length > 0;
    }

    public AddExclude(user: string) {
        this.excludes.push(user);
    }
}