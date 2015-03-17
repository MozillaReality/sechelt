(function(scope) {
  var buttonOrder = [
    // Yes, this looks dumb.
    [0, ["buttons", "face", 0]],
    [1, ["buttons", "face", 1]],
    [2, ["buttons", "face", 2]],
    [3, ["buttons", "face", 3]],
    [4, ["buttons", "left_shoulder", 0]],
    [5, ["buttons", "right_shoulder", 0]],
    [6, ["buttons", "left_shoulder", 1]],
    [7, ["buttons", "right_shoulder", 1]],
    [8, ["buttons", "control", 0]],
    [9, ["buttons", "control", 1]],
    [10, ["sticks", 0, "press"]],
    [11, ["sticks", 1, "press"]],
    // ... but yeah.
    [16, ["buttons", "control", 2]]
  ];
  // The d-pad needs special handling.
  // For d-pads mapped to buttons.
  var dPadButtons = [
    [12, ["d-pads", 0, "up"]],
    [13, ["d-pads", 0, "down"]],
    [14, ["d-pads", 0, "left"]],
    [15, ["d-pads", 0, "right"]]
  ];
  // For d-pads mapped to axes.
  var dPadAxes = [
    [12, -1, ["d-pads", 0, "up"]],
    [13,  1, ["d-pads", 0, "down"]],
    [14, -1, ["d-pads", 0, "left"]],
    [15,  1, ["d-pads", 0, "right"]]
  ];
  var axisOrder = [
    ["sticks", 0, "x"],
    ["sticks", 0, "y"],
    ["sticks", 1, "x"],
    ["sticks", 1, "y"]
  ];
  // Used to remap already-standard-mapped Gamepads that don't
  // match the latest spec exactly.
  var identityMapping = {
      "sticks": [
          {
              "x": 0,
              "y": 1,
              "press": 10
          },
          {
              "x": 2,
              "y": 3,
              "press": 11
          }
      ],
      "d-pads": [
          {
              "type": "buttons",
              "up": 12,
              "down": 13,
              "left": 14,
              "right": 15
          }
      ],
      "buttons": {
          "face": [
              {"button": 0},
              {"button": 1},
              {"button": 2},
              {"button": 3}
          ],
          "control": [
              {"button": 8},
              {"button": 9} ,
              {"button": 16}
          ],
          "left_shoulder": [
              {"button": 4},
              {"button": 6}
          ],
          "right_shoulder": [
              {"button": 5},
              {"button": 7}
          ]
      }
  };
  var allMappings = null;
  var usedMappings = [];
  var usedPads = [];
  function loadMappings(mappings) {
    var thisType = null;
    if (navigator.platform.match(/^Linux/)) {
      thisType = "linux";
    } else if (navigator.platform.match(/^Mac/)) {
      thisType = "hid";
    } else if (navigator.platform.match(/^Win/)) {
      var m = navigator.userAgent.match("Gecko/(..)");
      if (m && parseInt(m[1]) < 32) {
        thisType = "dinput";
      } else {
        thisType = "hid";
      }
    }
    if (!thisType) {
      return;
    }
    allMappings = {};
    for (var i = 0; i < mappings.length; i++) {
      if (mappings[i].type != thisType) {
        continue;
      }

      if (!(mappings[i].vendor_id in allMappings)) {
        allMappings[mappings[i].vendor_id] = {};
      }
      allMappings[mappings[i].vendor_id][mappings[i].product_id] = mappings[i];
    }
  }

  function getIDs(id) {
    var bits = id.split('-');
    if (bits.length < 2) {
      var match = id.match(/Vendor: (\w+) Product: (\w+)/);
      if (!match) {
        return null;
      }

      return match.slice(1);
    }

    return bits.slice(0, 2);
  }

  function findMapping(pad) {
    if (usedMappings[pad.index] && usedMappings[pad.index].id == pad.id) {
      return usedMappings[pad.index].mapping;
    }
    var mapping = null;
    if (pad.id.match(/STANDARD GAMEPAD/)) {
      // Make older versions of Chrome match the updated spec.
      mapping = identityMapping;
    } else if (allMappings) {
      // Look up a mapping by vendor id, product id
      var ids = getIDs(pad.id);
      if (ids && ids[0] in allMappings && ids[1] in allMappings[ids[0]]) {
        mapping = allMappings[ids[0]][ids[1]];
      }
    }
    if (mapping) {
      usedMappings[pad.index] = {id: pad.id, mapping: mapping};
      return mapping;
    }
    return null;
  }

  function getPad(pad) {
    function button() {
      this.pressed = false;
      this.value = 0.0;
    }
    if (usedPads[pad.index] && usedPads[pad.index].id == pad.id) {
      // Recycle. Should we keep a few objects so we don't return the same
      // object every time?
      return usedPads[pad.index];
    }
    var newpad = {buttons: new Array(17), axes: [0.0, 0.0, 0.0, 0.0],
                 id: pad.id, index: pad.index, mapping: "standard"};
    for (var i = 0; i < newpad.buttons.length; i++) {
      newpad.buttons[i] = new button();
    }
    // Cache it so we don't have to create a new object every time.
    usedPads[pad.index] = newpad;
    return newpad;
  }

  function getprop(thing, props) {
    props = props.slice(0);
    while (props.length) {
      var p = props.shift();
      if (p in thing) {
        thing = thing[p];
      } else {
        return undefined;
      }
    }
    return thing;
  }

  function mapButton(pad, thisButton, map, buttons) {
    var button = buttons[thisButton[0]];
    var p = getprop(map, thisButton[1]);
    if (p != undefined) {
      var b = typeof(p) == "number" ? p : ("button" in p ? p.button : -1);
      var a = (typeof(p) == "object" && "axis" in p) ? p.axis : -1;
      if (a != -1) {
        button.value = (pad.axes[a] + 1.0) / 2.0;
        if (b == -1) {
          button.pressed = button.value > 0.25;
        }
      }
      if (b != -1) {
        button.pressed = typeof(pad.buttons[b]) == "number" ? (pad.buttons[b] == 1.0) : pad.buttons[b].pressed;
        if (a == -1) {
          button.value = typeof(pad.buttons[b]) == "number" ? pad.buttons[b] : pad.buttons[b].value;
        }
      }
      button.name = map.names[thisButton[0]];
    } else {
      button.pressed = false;
      button.value = 0.0;
    }
  }

  function mapAxis(pad, thisAxis, map, axes, i) {
    var a = getprop(map, thisAxis);
    if (a != undefined) {
      axes[i] = pad.axes[a];
    } else {
      axes[i] = 0.0;
    }
  }

  function mapHalfAxisToButton(pad, thisAxis, map, buttons) {
    var button = buttons[thisAxis[0]];
    var direction = thisAxis[1];
    var p = getprop(map, thisAxis[2]);
    var a = typeof(p) == "number" ? p : ("axis" in p ? p.axis : -1);
    if (p != -1) {
      var value = pad.axes[a];
      if (direction < 0 && value < 0) {
        button.value = -value;
        button.pressed = value < -0.25;
      } else if (direction > 0 && value > 0) {
        button.value = value;
        button.pressed = value > 0.25;
      } else {
        button.pressed = false;
        button.value = 0.0;
      }
    } else {
      button.pressed = false;
      button.value = 0.0;
    }
  }

  function applyMapping(pad, map) {
    var newpad = getPad(pad);
    newpad.timestamp = pad.timestamp ? pad.timestamp : performance.now();
    for (var i = 0; i < buttonOrder.length; i++) {
      mapButton(pad, buttonOrder[i], map, newpad.buttons);
    }
    // Handle d-pad.
    var type = getprop(map, ["d-pads", 0, "type"]);
    if (type == "buttons") {
      for (i = 0; i < dPadButtons.length; i++) {
        mapButton(pad, dPadButtons[i], map, newpad.buttons);
      }
    } else if (type == "axes") {
      for (i = 0; i < dPadAxes.length; i++) {
        mapHalfAxisToButton(pad, dPadAxes[i], map, newpad.buttons);
      }
    } else if (type == "dpad") {
      //TODO: for d-pads exposed as hat switches
    }

    for (i = 0; i < newpad.axes.length; i++) {
      mapAxis(pad, axisOrder[i], map, newpad.axes, i);
    }
    return newpad;
  }

  function remapGamepad(pad) {
    if (pad && pad.mapping != "standard") {
      var map = findMapping(pad);
      if (map) {
        return applyMapping(pad, map);
      }
    }
    return pad;
  }

  function getGamepads() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    var newpads = new Array(pads.length);
    for (var i = 0; i < pads.length; i++) {
      newpads[i] = remapGamepad(pads[i]);
    }
    return newpads;
  };

  scope.getGamepads = getGamepads;
  scope.remapGamepad = remapGamepad;

  // Get the mapping DB from GitHub.
  var req = new XMLHttpRequest();
  req.onload = function() {
    if (req.status == 200) {
      loadMappings(JSON.parse(req.responseText).mappings);
    }
  };
  req.open("GET", "js/mappings.json", true);
  req.send(null);
})(window);
