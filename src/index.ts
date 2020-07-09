import { Client, Options, ChatUserstate } from 'tmi.js';
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import { MultiStreamHandler } from "./MultiStreamHandler";
import id from "../auth.json";
import { CommandHandler } from './CommandHandler';

const primaryChannel: string = "kateract";
const timeoutInterval: number = 10*60*1000;
let currentRoll = 0
let rollChats = ["Kateract is a member of theSHED! Find out more about this great gaming community and it's members by visiting https://theshed.gg"]

var rolling: boolean = false;
let subscribing: boolean = false;

const db = new JsonDB(new Config("ChatBot", true, true, '/'))

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
const command: CommandHandler = new CommandHandler(client, db, primaryChannel);

client.connect().catch((err: any) => console.log(err));

client.on("connected", (address: any, port: any) => {
    console.log(`Connected to ${address}:${port} as ${id.username}`);
});

client.on("join", (channel: string, username: string, self: boolean) => {
    if (channel === `#${primaryChannel}` && rolling == false)
    {
        RollTimerChats();
    }
});

client.on("message", (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    if (message[0] == "!" && channel === `#${primaryChannel}`)
        command.ParseCommand(channel, tags, message);
    if (subscribing && channel !== `#${primaryChannel}`) {
        client.say(primaryChannel, `[${channel.substring(1)}] ${tags.username}: ${message}`);
    }
});

function RollTimerChats(): void 
{
    setTimeout(function run() {
        client.say(primaryChannel, rollChats[currentRoll]);
        currentRoll = (currentRoll + 1) % rollChats.length;
        setTimeout(run, timeoutInterval);
    }, timeoutInterval);
}