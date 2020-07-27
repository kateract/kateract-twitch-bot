import { MultiStreamHandler } from '../multi/MultiStreamHandler';
import { StorageService } from '../storage/StorageService';
import { ChatManager } from './ChatManager';
import { IChatUser } from './IChatUser';
import { IChannel } from './IChannel';
import { FriendCodeHandler } from '../multi/FriendCodeHandler';

export class CommandHandler {
    constructor(
        private readonly manager: ChatManager,
        private readonly multi: MultiStreamHandler,
        private readonly friend: FriendCodeHandler,
        storage: StorageService) {
            manager.Chats$.subscribe(msg => this.ParseCommand(msg.Channel, msg.User, msg.Message, msg.Self))
    }

    public ParseCommand(channel: IChannel, user: IChatUser, message: string, self: boolean): void {
        let parts = message.split(' ');
        if (parts[0] === "!multi") {
            this.multi.Handle(parts, channel, user);
        }
        if (parts[0] === "!nm")
        {
            this.friend.Handle(parts, channel, user);
        }

    }

}