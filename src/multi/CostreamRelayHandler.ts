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
        if (this.subscribers.findIndex(i => i.Platform === platform && i.Channel === channel) < 0){
            this.subscribers.push({Platform: platform, Channel: channel});
        }
        return this.subscribers.length > 0;
    }

    public RemoveSubscriber(platform: string, channel: string)
    {
        this.subscribers.splice(this.subscribers.findIndex(i => i.Platform === platform && i.Channel === channel),1);
    }

    public PushMessage(channel: IChannel, user: IChatUser, message: string, self: boolean)
    {
        if(!self && !this.excludes.includes(user.Username)){
            this.subscribers.filter(s => !(s.Channel === channel.Channel && s.Platform === channel.Platform)).forEach(s => {
                this.manager.SendMessage(s, `[#${channel.Channel}] ${user.Username}: ${message}`);
            });
        }
    }

    public AreSubscribers(): boolean {
        return this.subscribers.length > 0;
    }

    public AddExclude(user: string) {
        if (!this.excludes.includes(user))
        {
            this.excludes.push(user);
        }
    }
}