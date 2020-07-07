import { Client, Options, ChatUserstate } from 'tmi.js'
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import id from "../auth.json";

const primaryChannel: string = "kateract"

var db = new JsonDB(new Config("ChatBot", true, true, '/'))
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
client.connect().catch((err: any) => console.log(err));

client.on("connected", (address: any, port: any) => {
    console.log(`Connected to ${address}:${port} as ${id.username}`);
});

client.on("message", (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    if (message[0] == "!")
        ParseCommand(channel, tags, message)
});
var data = db.getData("/costreamers")
var streamers: Array<string> = data ? data : new Array();

var ParseCommand = (channel: string, tags: ChatUserstate, message: string) => {
    var parts = message.split(' ');
    if (parts[0] === "!coco") {
        if (parts.length == 1) {
            var uri: string = `https://multi.raredrop.co/t${primaryChannel}`;
            for (var i = 0; i < streamers.length; i++) {
                uri += `/t${streamers[i]}`;
            }
            console.log(`${channel}[${options.identity.username}] - ${uri}`)
            client.say(channel, `Check out all the streamers here: ${uri}`).catch((err) => console.log(err));
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "add") {
            for (var i = 2; i < parts.length; i++) {
                if (parts[i].trim().length > 0) {
                    streamers.push(parts[i]);
                }
            }
            db.push("/costreamers", streamers);
        }
        else if (parts.length > 1 && parts[1].toLowerCase() == "clear") {
            streamers = new Array();
            db.push("/costreamers", streamers);
        }
    }
}