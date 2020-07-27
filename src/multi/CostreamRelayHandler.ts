import { Client, ChatUserstate } from 'tmi.js';
import { ChatManager } from '../chat/ChatManager';
import { IChannel } from '../chat/IChannel';
import { IChatUser } from '../chat/IChatUser';

export class CostreamRelayHandler 
{
    private readonly subscribers: Array<IChannel>;
    private readonly excludes: Array<string>;

    constructor(private manager: ChatManager )
    {
        this.subscribers = new Array<IChannel>();
        this.excludes = new Array<string>();
        manager.Chats$.subscribe(chat => this.PushMessage(chat.Channel, chat.User, chat.Message, chat.Self))
    }

    public AddSubscriber(platform: string, channel: string) : boolean
    {
        if (this.subscribers.indexOf({Platform: platform, Channel: channel}) < 0){
            this.subscribers.push({Platform: platform, Channel: channel});
        }
        //console.log(this.subscribers)

        return this.subscribers.length > 0;
    }

    public RemoveSubscriber(platform: string, channel: string)
    {
        this.subscribers.splice(this.subscribers.indexOf({Platform: platform, Channel: channel}),1);
    }

    public PushMessage(channel: IChannel, user: IChatUser, message: string, self: boolean)
    {
        //console.log (`Message from ${channel.Channel}! Self? ${self}`)
        
        if(!self){//} && !(this.excludes.indexOf(user.Username) >= 0)){
            this.subscribers.filter(s => !(s.Channel === channel.Channel && s.Platform === channel.Platform)).forEach(s => {
                //console.log(`relaying message from ${channel} to #${s}!`)
                this.manager.SendMessage(s, `[#${channel.Channel}] ${user.Username}: ${message}`);
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