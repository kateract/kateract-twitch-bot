import { Client, Options, ChatUserstate } from 'tmi.js';
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { MultiStreamHandler } from "./MultiStreamHandler";
import id from "../auth.json";
import { CommandHandler } from './CommandHandler';
import { CostreamRelayHandler } from './CostreamRelayHandler';
import { StorageService } from './StorageService';
import { TwitchChatService } from './TwitchChatService';
import { IChatService } from './IChatService';
import { ChatManager } from './ChatManager';
import { IChannel } from './IChannel';

const primaryChannel: IChannel = {Platform: 'twitch', Channel: "kateract"};
const timeoutInterval: number = 5*60*1000;
let rollChats = ["Nintendo Monday is brought to you by theSHED! Find out more about this great gaming community and it's members by visiting https://theshed.gg",
                 "Use the !multi command to check out all the streamers live!"]

const options: Options = {
    identity: id,
    options: {
        debug: true,
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
const command: CommandHandler = new CommandHandler(manager, multi, storageService);


