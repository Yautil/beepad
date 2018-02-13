"use strict";
//  BeePad - NodeJS Server File
//     BeePad is an anonym collaborative online text-editor
//     Copyright (C) 2018 Benjamin Laws, Ann-Kathrin Hillig, Matthias Schroer, Miguel Oppermann

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.

//  Load and define external modules
//  #   ExpressJS, and Server Helper Modules
var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var socketio = require("socket.io");
var dmp = require("diff-match-patch");

//  #   MongoDB Module
var mongoose = require("mongoose");

//  #   Dev Helper Modules
var path = require("path");
var chalk = require("chalk");

//  Configurations
const dev = true;
const useDMP = true;
const server_port = process.env.PORT || 80;
const db_uri = "mongodb://localhost/beePad";

//  Define Request Handler
var app = express();

//  Handle HTTP POST requests
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(bodyParser.urlencoded({ extended: true }));

//  Override HTTP Header
app.use(methodOverride("X-HTTP-Method-Override"));

//  Define static public folder
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "dist")));
app.use("css", express.static(path.join(__dirname, "dist/css")));
if (dev) app.use("dev", express.static(path.join(__dirname, "dist/dev")));

//  Set Routing for Root and Wildcard 
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist") + "/main.html")
})

app.get("/pad/*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "app") + "/pad.html")
})

//  Set routing for Debugging if in dev mode
if (dev) {
    app.get("/debug/*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "./dist/dev/", "debug.html"));
    })
};

//  Start Server and attach socketio
var server = app.listen(server_port);
var io = socketio(server);

//  Providing Database Logic and override db_uri if in dev
mongoose.connect(db_uri, { useMongoClient: true });
let mongodb = mongoose.connection;
mongodb.on("error", () => { console.log(chalk.red("DB Connection Error!")) });
mongodb.once("open", () => { console.log(chalk.green("DB Connected to MongoDB!")) });
mongoose.Promise = global.Promise;

//  #   Define Database Model
var dbSchema = mongoose.Schema({
    permalink: String,
    text: String
})

var dbModel = mongoose.model("Pad", dbSchema);

//  Providing Connection Logic
//  #   On a new Connection...
io.on("connection", socket => {
    var _id = socket.id;
    if (dev)
        console.log(`${chalk.yellow("New Connection: ")}
            Socket ID: ${chalk.blue(socket.id)}
            Socket IP: ${chalk.green(socket.handshake.address)}`);

    // On event "join_into_pad"
    socket.on("joinPad", (padPermalink, callback) => {
        if (padPermalink.includes("lock")) {
            callback({ msg: "ATTENTION: " + padPermalink })
        } else {
            socket.join(padPermalink, () => {
                callback({ msg: "OK: Joined Pad " + padPermalink });
            })
        }
        // socket.to(payload.padPermalink).emit("newAuthor", payload.authorName)
    });

    // On Disconnect
    socket.on("disconnect", () => {
        if (dev) console.log(chalk.red(socket.id + " disconnected"));
    });

    // Read the text of a pad by permalink
    socket.on("dbReadText", (padPermalink, callback) => {
        dbModel.findOne({ "permalink": padPermalink }, "text", (err, dbModel) => {
            if (err && dev) return console.log(err);
            if (!dbModel) return callback("none");
            if (dev) console.log("Text in DB: " + dbModel.text);
            return callback(dbModel.text);
        })
    });

    // send newText to other Clients
    socket.on("deployChanges", (padPermalink, newText, cursorStart, cursorEnd) => {
        if (!(padPermalink.includes("lock"))) {
            dbModel.findOneAndUpdate({ "permalink": padPermalink }, { text: newText }, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, res) => {
                if (err && dev) console.log(err);
                if (dev) console.log(res);
            });
        socket.to(padPermalink).emit("applyChanges", newText, cursorStart, cursorEnd, useDMP)
        };
    })

    socket.on("lockDoc", (padPermalink, newText) => {
            padPermalink = padPermalink + "lock"
            dbModel.findOneAndUpdate({ "permalink": padPermalink }, { text: newText }, { upsert: true, new: true, setDefaultsOnInsert: true }, (err, res) => {
                if (err && dev) console.log(err);
                if (dev) console.log(res);
            });
        socket.to(padPermalink).emit("applyChanges", newText, cursorStart, cursorEnd, useDMP);
    })

    socket.on("bla", (sendTime) => {
        console.log("Got some Ping, make some Pong");
        console.log(sendTime);
        socket.emit("blub", sendTime);
    })
});

//  Console Output
console.log(`======= ${chalk.black.bgWhite("BEEPAD SERVER")} =======
${chalk.green("Server is running on PORT")} ${chalk.yellow(server_port)}`);
if (process.env.TEST) process.exit(0);