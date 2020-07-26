import { Client, Options, ChatUserstate } from 'tmi.js';
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { MultiStreamHandler } from "./MultiStreamHandler";
import id from "../auth.json";
import { CommandHandler } from './CommandHandler';
import { CostreamRelayHandler } from './CostreamRelayHandler';
import { StorageService } from './StorageService';

const primaryChannel: string = "kateract";
const timeoutInterval: number = 5*60*1000;
let rollChats = ["Nintendo Monday is brought to you by theSHED! Find out more about this great gaming community and it's members by visiting https://theshed.gg",
                 "Use the !multi command to check out all the streamers live!"]

var rolling: boolean = false;
let subscribing: boolean = false;

const db = new JsonDB(new Config("ChatBot", true, true, '/'))
const storageService = StorageService.GetService(db);
const options: Options = {
    identity: id,
    options: {
        debug: true,
    },
    connection: {
        reconnect: true,
        secure: true
    },
    channels: [primaryChannel]
};

const client: Client = Client(options);
const corelay: CostreamRelayHandler = new CostreamRelayHandler(client);
const multi: MultiStreamHandler = new MultiStreamHandler(client, primaryChannel, corelay, storageService);
const command: CommandHandler = new CommandHandler(client, primaryChannel, timeoutInterval, multi, storageService);

client.connect().catch((err: any) => console.log(err));

client.on("connected", (address: any, port: any) => {
    console.log(`Connected to ${address}:${port} as ${id.username}`);
});

client.on("join", (channel: string, username: string, self: boolean) => {
    if (channel === `#${primaryChannel}` && rolling == false)
    {
        command.RollTimerChats(primaryChannel, rollChats);
        rolling = true;
    }
    multi.ResolveChannels();
});

client.on("message", (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    else if (message[0] == "!")
        command.ParseCommand(channel, tags, message);
    else if (multi.IsSubscribing()) {
        corelay.PushMessage(channel, tags, message);
    }
});

