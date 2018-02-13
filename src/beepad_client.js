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
   converter.setFlavor('github');
   converter.setOption("openLinksInNewWindow", "true");
   converter.setOption("tables", "true");
   // converter.setOption("")

   // Little Helper
   var beePad = document.getElementById("beePad");

   //cursor positions
   var cursor_start = 0;
   var cursor_end = 0;

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

   // OLD Function to create a Text Patch
//    function patch_create(newText, cursorStart, cursorEnd) {

//        var myText = beePad.value;
//        var diff = dmp.diff_main(myText, newText, true);

//        //may be problematic here cause of timing problems
//        cursor_start = beePad.selectionStart;
//        cursor_end = beePad.selectionEnd;
//        var offset = 0;
//        diff.forEach(element => {
//            if (element[0] == -1) {
//                offset -= element[1].length;
//            }
//            if (element[0] == 1) {
//                offset += element[1].length;
//            }
//        });
//        console.log("Offset: " + offset + "  cursorStart: " + cursorStart + " eigener Cursor start: " + cursor_start + " cursorEnde: " + cursorEnd + " eigener Ende: " + cursor_end);
//        if (cursorStart <= cursor_start)
//            cursor_start = (cursor_start + offset < 0) ? 0 : cursor_start + offset;

//        if (cursorEnd <= cursor_end)
//            cursor_end = (cursor_end + offset < 0) ? 0 : cursor_end + offset;


//        if (diff.length > 2) {
//            dmp.diff_cleanupEfficiency(diff);
//        }

//        var patch_list = dmp.patch_make(myText, newText, diff);
//        return dmp.patch_toText(patch_list);
//    }

   // OLD Function to apply a Text Patch
//    function patch_apply(patch_text, cursorPositons) {
//        var myText = beePad.value;
//        var patches = dmp.patch_fromText(patch_text);

//        var results = dmp.patch_apply(patches, myText);
//        beePad.value = results[0];
//    }

   // Client-Response to "applyChanges"
   socket.on("applyChanges", (newText) => {
       patch = JsDiff.createPatch("fileName", beePad.value, newText, "oldHeader", "newHeader")
       beePad.value = JsDiff.applyPatch(beePad.value, patch);
       parseMarkdown();
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

   function getCursors() {
       cursor_start = beePad.selectionStart;
       cursor_end = beePad.selectionEnd;
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