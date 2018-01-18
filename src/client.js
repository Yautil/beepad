import io from "socket.io-client";
import DiffMatchPatch from "diff-match-patch";
import showdown from "showdown";

// Permalink is in Pathname...
var padPermalink = window.location.pathname;
// ...but behind "/pad/" (5 chars)
padPermalink = padPermalink.slice(5);

// Socket.io Handler
const socket = io();

// Diff_Match_Patch Handler
var dmp = new DiffMatchPatch();
// Showdown Handler to parse markdown
var converter = new showdown.Converter();
// Configurations for showdown
converter.setFlavor('github');
converter.setOption("openLinksInNewWindow", "true");
converter.setOption("tables", "true");

// Little Helper
var beePad = document.getElementById("beePad");

// Tell Server, we want to join our permalink Pad
socket.emit("joinPad", padPermalink, (callback) => {
    document.getElementById("serverStatus").innerHTML = callback.msg;
});

// Read what is our initial Text (The One in DB atm.)
socket.emit("dbReadText", padPermalink, (callback) => {
    if (callback == "none") window.location.replace("/");
    beePad.value = callback;
    parseMarkdown();
});


// Function to create a Text Patch
function patch_create(newText) {
    var myText = beePad.value;
    var diff = dmp.diff_main(myText, newText, true);

    if (diff.length > 2) {
        dmp.diff_cleanupSemantic(diff);
    }

    var patch_list = dmp.patch_make(myText, newText, diff);
    return dmp.patch_toText(patch_list);
}

// Function to apply a Text Patch
function patch_apply(patch_text) {
    var myText = beePad.value;
    var patches = dmp.patch_fromText(patch_text);

    var results = dmp.patch_apply(patches, myText);
    beePad.value = results[0];
}

// Client-Response to "applyChanges"
socket.on("applyChanges", (newText, useDMP) => {
    // Remember our cursor position
    var cursor_start = beePad.selectionStart;
    var cursor_end = beePad.selectionEnd;
    // Depending on Server Configurations either use DMP or directly update
    if (useDMP) {
        patch_apply(patch_create(newText));
    } else {
        beePad.value = newText;
    }
    // Jump Back to our old cursor position
    beePad.selectionStart = cursor_start;
    beePad.selectionEnd = cursor_end;
    parseMarkdown();
});

// Tell server that we have made some changes and want to deploy them
function deployChanges() {
    parseMarkdown();
    socket.emit("deployChanges", padPermalink, beePad.value)
}

// Funtion to directly parse markdown into div
function parseMarkdown() {
    document.getElementById("copy").innerHTML = "Einladen";
    document.getElementById("markdown").innerHTML = converter.makeHtml(beePad.value);
}

// Create Event-Listener to write into clipboard when event is called
document.getElementById("copy").addEventListener("copy", function (event) {
    event.preventDefault();
    if (event.clipboardData) {
        event.clipboardData.setData("text/plain", window.location.host + window.location.pathname);
        console.log(event.clipboardData.getData("text"))
        document.getElementById("copy").innerHTML = "Link Kopiert!";
    }
});