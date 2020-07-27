import { MultiStreamHandler } from './MultiStreamHandler';
import { StorageService } from './StorageService';
import { ChatManager } from './ChatManager';
import { IChatUser } from './IChatUser';
import { IChannel } from './IChannel';

export class CommandHandler {
    constructor(
        private readonly manager: ChatManager,
        private readonly multi: MultiStreamHandler,
        storage: StorageService) {
            manager.Chats$.subscribe(msg => this.ParseCommand(msg.Channel, msg.User, msg.Message, msg.Self))
    }

    public ParseCommand(channel: IChannel, user: IChatUser, message: string, self: boolean): void {
        let parts = message.split(' ');
        if (parts[0] === "!multi") {
            this.multi.Handle(parts, channel, user);
        }
    }

}