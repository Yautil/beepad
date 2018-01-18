// import { connect } from "tls";

// import { connect } from "http2";
// import { sio } from "socket.io";

// import { markdown } from "markdown";
("use strict");

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module("clientApp").controller("MainCtrl", [
   "$scope",
   function($scope) {
      "use strict";
      var socket = io();

      $scope.preview = true;

      socket.on("textChanged", data => {
         console.debug("textChanged");

         let editor = document.querySelector("#editor");
         let cursorPosition = editor.selectionEnd;
         let text = editor.value;

         document.querySelector("#mdView").innerHTML = markdown.toHTML(text);

         editor.value = data.payload;
         editor.selectionStart = cursorPosition;
         editor.selectionEnd = cursorPosition;
      });

      $scope.text = "#Hallo Welt \n\
Du kannst hier `Markdown benutzen!`";
      document.querySelector("#mdView").innerHTML = markdown.toHTML($scope.text);

      $scope.syncText = function() {
            console.log("changed");
            socket.emit("textChange", document.querySelector("#editor").value);
      };
   }
]);
