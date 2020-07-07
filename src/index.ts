import { Client, Options, ChatUserstate } from 'tmi.js';
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import id from "../auth.json";

const primaryChannel: string = "kateract"
const timeoutInterval: number = 10*60*1000;

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

client.on("join", (channel: string, username: string, self: boolean) => {
    if (channel === `#${primaryChannel}`)
    {
        RollTimerChats();
    }
});

client.on("message", (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    if (self) return;
    if (message[0] == "!" && channel === `#${primaryChannel}`)
        ParseCommand(channel, tags, message)
    if (subscribing && channel !== `#${primaryChannel}`) {
        client.say(primaryChannel, `[${channel.substring(1)}] ${tags.username}: ${message}`);
    }
});
try {
    var data = db.getData("/costreamers")
} catch (err) {
    console.log(err.message);
}
var streamers: Array<string> = data ? data : new Array();
var subscribing: boolean = false;

var ParseCommand = (channel: string, tags: ChatUserstate, message: string) => {
    var parts = message.split(' ');
    if (parts[0] === "!multi") {
        MultiHandler(parts, channel, tags);
    }
}

var MultiHandler = (parts: string[], channel: string, tags: ChatUserstate) => {
    if (parts.length == 1) {
        var uri: string = `https://multi.raredrop.co/t${primaryChannel}`;
        for (var i = 0; i < streamers.length; i++) {
            uri += `/t${streamers[i]}`;
        }
        console.log(`${channel}[${options.identity.username}] - ${uri}`)
        client.say(channel, `Check out all the streamers here: ${uri}`).catch((err) => console.log(err));
    }
    else if ((tags.badges?.broadcaster == '1' || tags.mod) && parts.length > 1 && parts[1].toLowerCase() == "add") {
        for (var i = 2; i < parts.length; i++) {
            if (parts[i].trim().length > 0) {
                streamers.push(parts[i]);
            }
        }
        db.push("/costreamers", streamers);
    }
    else if ((tags.badges?.broadcaster == '1' || tags.mod) && parts.length > 1 && parts[1].toLowerCase() == "clear") {
        streamers = new Array();
        db.push("/costreamers", streamers);
    }
    else if ((tags.badges?.broadcaster == '1' || tags.mod) && parts.length > 1 && parts[1].toLowerCase() == "subscribe") {
        if (!subscribing)
        {
            subscribing = true;
        }
        var curChans = client.getChannels()
        console.log(curChans);
        streamers.forEach(streamer => {
            if (!curChans.includes(`#${streamer}`))
            {
                client.join(streamer);
            }
        });
    }
    else if (parts.length > 1 && parts[1].toLowerCase() == "unsubscribe") {
        if (subscribing)
        {
            subscribing = false;
        }
        var curChans = client.getChannels()
        {
            curChans.forEach((chan) => {
                if(chan != `#${primaryChannel}`)
                {
                    client.part(chan);
                }
            });
        }
    }
}
var currentRoll = 0
var rollChats = ["Kateract is a member of theSHED! Find out more about this great gaming community and it's members by visiting https://theshed.gg"]
var RollTimerChats = () => {
    setTimeout(function run() {
        client.say(primaryChannel, rollChats[currentRoll]);
        currentRoll = (currentRoll + 1) % rollChats.length;
        setTimeout(run, timeoutInterval);
    }, timeoutInterval);
}