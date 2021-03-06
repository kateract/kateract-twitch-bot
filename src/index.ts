import { Options } from 'tmi.js';
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { MultiStreamHandler } from "./multi/MultiStreamHandler";
import id from "../auth.json";
import { CommandHandler } from './chat/CommandHandler';
import { CostreamRelayHandler } from './multi/CostreamRelayHandler';
import { StorageService } from './storage/StorageService';
import { TwitchChatService } from './services/twitch/TwitchChatService';
import { IChatService } from './services/IChatService';
import { ChatManager } from './chat/ChatManager';
import { IChannel } from './chat/IChannel';
import { FriendCodeHandler } from './multi/FriendCodeHandler';

let args = process.argv.slice(2)
let inputPlatform = 'twitch'
let inputChannel = 'kateract'
if(args.length >= 2){
    inputPlatform = args[0];
    inputChannel = args[1];
}
const primaryChannel: IChannel = {Platform: inputPlatform, Channel: inputChannel};
const timeoutInterval: number = 5*60*1000;
let rollChats = ["Nintendo Monday is brought to you by theSHED! Find out more about this great gaming community and it's members by visiting https://theshed.gg",
                 "Use the !multi command to check out all the streamers live!"]

const options: Options = {
    identity: id,
    options: {
        debug: false,
    },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: [primaryChannel.Channel]
};

const db = new JsonDB(new Config("ChatBot", true, true, '/'))
const storageService = StorageService.GetService(db);
const twitch: IChatService = new TwitchChatService(options);

const manager = new ChatManager();
manager.AddChatService(twitch);
manager.JoinChannel({Platform: 'twitch', Channel: 'kateract'})
manager.Chats$.subscribe(chat => {
    console.log(`From ${chat.Channel.Platform}: [${chat.Channel.Channel}] ${chat.User.Username}: ${chat.Message}`)
})
const corelay: CostreamRelayHandler = new CostreamRelayHandler(manager);
const multi: MultiStreamHandler = new MultiStreamHandler(manager, primaryChannel, corelay, storageService);
const friend: FriendCodeHandler = new FriendCodeHandler(manager, storageService)
const command: CommandHandler = new CommandHandler(manager, multi, friend, storageService);


