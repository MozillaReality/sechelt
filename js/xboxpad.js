(function(define){define(function(require,exports,module){

  var xBoxPad = new evt();
  var interval;
  var buttonMapping =
    ["A", "B", "X", "Y", "LB", "RB","LT",
     "RT", "Back", "Start", "LS",
    "RS", "Up", "Down", "Left", "Right", "XBox"];
  var buttonStatus = [];
  var pollInterval = 50;
  var pad;

  window.addEventListener("gamepadconnected", connecthandler);
  window.addEventListener("gamepaddisconnected", disconnecthandler);

  function connecthandler(e) {
    pad = navigator.getGamepads()[e.gamepad.index];
    interval = setInterval(pollState, pollInterval)
    xBoxPad.connected = true;
    xBoxPad.fire('connected');
  }

  function pollState() {
    var gp = remapGamepad(pad);
    var pressedButtons = [];
    for (var i = 0; i < gp.buttons.length; i++) {
      var b = gp.buttons[i];
      var pressed = b.pressed;
      if (b.pressed) {
        if (!buttonStatus[i]) {
          pressedButtons.push(buttonMapping[i]);
          //console.log("BUTTON PRESSED " + i + " NAME " + buttonMapping[i]);
        }
      }
      buttonStatus[i] = pressed;
    }
    xBoxPad.fire('pressed', pressedButtons);
  }

  function disconnecthandler(e) {
    clearInterval(interval);
    xBoxPad.connected = false;
    xBoxPad.fire('connected');
  }

  module.exports = xBoxPad;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('xBoxPad',this));