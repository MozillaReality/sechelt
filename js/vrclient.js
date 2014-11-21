window.VRClient = (function() {
  function VRClient() {
    var self = this;

    // call back for render mode changes.
    self.onRenderModeChange = null;

    // this promise resolves when VR devices are detected.
    self.getVR = new Promise(function (resolve, reject) {
      if (navigator.getVRDevices) {
        navigator.getVRDevices().then(function (devices) {
          for (var i = 0; i < devices.length; ++i) {
            if (devices[i] instanceof HMDVRDevice && !self.hmdDevice) {
              self.hmdDevice = devices[i];
            }
            if (devices[i] instanceof PositionSensorVRDevice &&
                devices[i].hardwareUnitId == self.hmdDevice.hardwareUnitId &&
                !self.positionDevice) {
              self.positionDevice = devices[i];
              break;
            }
          }
          if (self.hmdDevice && self.positionDevice) {
            console.log('VR devices detected');
            resolve({
              hmd: self.hmdDevice,
              position: self.positionDevice
            });
            return;
          }
          reject('no VR devices found!');
        }).catch(reject);
      } else {
        reject('no VR implementation found!');
      }
    });

    self.wait = new Promise(function (resolve) {
      self.startDemo = resolve;
    });

    self.sendMessage('loading', self.getPageMeta());

    // listen for any post messages
    window.addEventListener("message", function (e) {
      var msg = e.data;
      if (!msg.type) {
        return;
      }

      //console.log('message received ', msg.type, msg.data);

      switch (msg.type) {
        case 'start':
          self.startDemo();
          break;
        case 'renderMode':
          self.setRenderMode(msg.data);
          break;
        case 'onZeroSensor':
          self.zeroSensor();
          break;
        case 'onBlur':
          if (typeof self.onBlur == 'function') {
            self.onBlur();
          }
          break;
        case 'onFocus':
          if (typeof self.onFocus == 'function') {
            self.onFocus();
          }
          break;
      }
    }, false);
  }

  VRClient.prototype.getPageMeta = function() {
    // capture page meta
    // title tag
    var title;
    try {
      title = document.getElementsByTagName('title')[0].textContent;
    } catch(e) {
      title = undefined;
    }

    // description meta
    var description;
    try {
      description = document.querySelector("meta[name=\'description\']").content;
    } catch(e) {
      description = undefined;
    }

    return {
      title: title,
      description: description
    }
  };

  VRClient.prototype.sendMessage = function (type, data) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: type,
        data: data
      }, '*');
    }
  };

  VRClient.prototype.load = function (url, opts) {
    if (!opts) {
      opts = {}
    }

    this.sendMessage('load', {
      url: url,
      opts: opts
    });
  };

  // Takes value 0..1 to represent demo load progress. Optional.
  VRClient.prototype.progress = function (val) {
    this.sendMessage('progress', val);
  };

  // Notifies VRManager that demo is ready. Required.
  VRClient.prototype.ready = function () {
    this.sendMessage('ready');
    return this.wait;
  };

  // if this demo has an completed and we can shit it down.
  VRClient.prototype.ended = function() {
    this.sendMessage('ended');
  };


  VRClient.prototype.zeroSensor = function () {
    var self = this;
    self.getVR.then(function () {
      if (typeof self.onZeroSensor == 'function') {
        self.onZeroSensor();
      }
    });
  };

  VRClient.prototype.setRenderMode = function(mode) {
    var self = this;

    if (typeof self.onRenderModeChange == 'function') {
      self.onRenderModeChange(mode);
    }
  };

  VRClient.renderModes = VRClient.prototype.renderModes = {
    mono: 1,
    stereo: 2,
    vr: 3
  };

  return new VRClient();

})();
