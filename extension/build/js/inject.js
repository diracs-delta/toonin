!function(e){var t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){!function(e){var t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t){console.log("Script finally running");var n=chrome.runtime.connect({name:"toonin-extension"});console.log(n);var o=document.createElement("div");o.id="tooninBox",o.style.display="inline-block",o.style.position="absolute",o.style.top="30px",o.style.right="30px",o.style.zIndex="10000",o.innerHTML='<div> <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"> <link rel="stylesheet" href="https://code.getmdl.io/1.3.0/material.blue-light_blue.min.css"/> <script defer src="https://code.getmdl.io/1.3.0/material.min.js"><\/script> <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.12/css/all.css" integrity="sha384-G0fIWCsCzJIMAVNQPfjH08cyYaUtMwjJwqiRKxxE/rx96Uroj1BtIQ6MLJuheaO9" crossorigin="anonymous"> <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> <style>.demo-card-square.mdl-card{width: 320px; height: 320px;}.demo-card-square>.mdl-card__title{background: url("https://image.ibb.co/fRYLty/bg.png") center / cover; color: #66B7DA;}.ic-share{margin-right: 4px;}.room-id-text{visibility: hidden; margin: 0%;}.spinner{font-size: 50px; font-family: sans-serif; color: palevioletred; margin: 0%; animation-play-state: paused;}</style> <div class="demo-card-square mdl-card mdl-shadow--2dp"> <div class="mdl-card__title mdl-card--expand"> <h2 class="mdl-card__title-text">Toonin </h2> </div><div class="mdl-card__actions mdl-card--border"> <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" id="btnShare"> <i class="fas fa-music ic-share"></i> Start Sharing </a> <p class="mdl-card__supporting-text room-id-text" id="roomID"> </p></div></div></div>',document.body.appendChild(o),function(e){console.log("its being called");var t=0,n=0,o=0,i=0;function r(r){r=r||window.event,t=o-r.clientX,n=i-r.clientY,o=r.clientX,i=r.clientY,e.style.top=e.offsetTop-n+"px",e.style.left=e.offsetLeft-t+"px"}function s(){document.onmouseup=null,document.onmousemove=null}e.onmousedown=function(e){e=e||window.event,o=e.clientX,i=e.clientY,document.onmouseup=s,document.onmousemove=r}}(document.getElementById("tooninBox"));const i=document.getElementById("btnShare"),r=document.getElementById("roomID");i.onclick=function(){n.postMessage({type:"init"})},n.onMessage.addListener(function(e){console.log(e),"audio"==e.type?"ok"==e.status&&(localAudio.src=e.url):"roomID"==e.type&&(r.innerHTML="Your Toonin ID is: \n"+e.roomID,r.style.visibility="visible")})}])}]);