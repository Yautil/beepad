// Permalink is in Pathname...
var padPermalink = window.location.pathname;
// ...but behind "/pad/" (5 chars)
padPermalink = padPermalink.slice(5);

// Socket.io Handler
const socket = io();

// Diff_Match_Patch Handler, wenn der sich benimmt, darf er auch wieder ins Projekt!
// var dmp = new diff_match_patch();
// Hier ist jsdiff aber würdiger Ersatz!

// Showdown Handler to parse markdown
var converter = new showdown.Converter();
// Configurations for showdown
converter.setFlavor("github");
converter.setOption("openLinksInNewWindow", "true");
converter.setOption("tables", "true");
// converter.setOption("")

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

new Clipboard(".copy-btn", {
    text: () => { return window.location.host + window.location.pathname; }
});

if (padPermalink.includes("lock")) {
    document.getElementById("lock").innerHTML = "";
}

// Client-Response to "applyChanges"
socket.on("applyChanges", (newText) => {

    // Do some fixed caret shit
    tempCaretStart = beePad.selectionStart;
    tempCaretEnd = beePad.selectionEnd;

    var patch = JsDiff.createPatch("fileName", beePad.value, newText, "oldHeader", "newHeader");
    beePad.value = JsDiff.applyPatch(beePad.value, patch);

    parseMarkdown();

    // DirtyFix only
    beePad.selectionStart = tempCaretStart;
    beePad.selectionEnd = tempCaretEnd;
});

socket.on("blub", (sendTime) => {
    var myTime = Math.floor(Date.now());
    var time = myTime - sendTime;
    console.log("pong came back after " + time + "ms");
});

function getLatency() {
    var myTime = Math.floor(Date.now());
    socket.emit("bla", myTime);
}

// Tell server that we have made some changes and want to deploy them
function deployChanges() {
    parseMarkdown();
    socket.emit("deployChanges", padPermalink, beePad.value);
}

// Funtion to directly parse markdown into div
function parseMarkdown() {
    document.getElementById("markdown").innerHTML = converter.makeHtml(beePad.value);
}

function lockThisDoc() {
    if (!(padPermalink.includes("lock"))) {
        let lockDoc = padPermalink + "lock";
        socket.emit("lockDoc", padPermalink, beePad.value);
        window.location.replace("/pad/" + lockDoc);
    }
}

function printMarkdown() {
    var mywindow = window.open("", "PRINT", "height=800,width=800");
    mywindow.document.write("<html><head><title> Created in BeePad </title>");
    mywindow.document.write("</head><body>");
    mywindow.document.write(document.getElementById("markdown").innerHTML);
    mywindow.document.write("</body></html>");
    mywindow.document.close();
    mywindow.focus();
    mywindow.print();
    mywindow.close();
    return true;
}