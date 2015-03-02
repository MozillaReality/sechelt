var Sketch2three = (function() {
  function Sketch2three() {
    var self = this;
    self.slices = [];
    self.opts = {};
    self.url = null;

    var geometry = new THREE.PlaneGeometry( 1, 1, 72, 0 );

    this.makeMesh = function(node) {
      var path = self.getPath() + '/' + node.name;
      
      var props = node.properties;

      var texture = THREE.ImageUtils.loadTexture(path);

      var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
        //wireframe: true
      });

      var mesh = new THREE.Mesh(geometry.clone(), material);

      var scale = self.pixelScale;

      var y = props.y + (props.height / 2);
      var x = props.x + (props.width / 2);

      mesh.name = node.name;
      mesh.scale.set(props.width * scale, props.height * scale, 1);
      mesh.position.set(x * scale, -y * scale, 0);
      mesh.userData = props;
      
      return mesh;
    }

    this.getMeshes = function(search) {
      return self.meshes.filter(function(meshes) {
        return meshes.name.indexOf(search) > -1
      });
    }


    this.getPath = function() {
      return self.url.substring(0, self.url.lastIndexOf('/'));
    }
    

    this.load = function(url, opts) {
      self.opts = opts || {};

      self.pixelScale = self.opts.pixelScale || 1;

      return new Promise(function(resolve, reject) {
        if (!url) {
          reject('must point to a sketch json file.')
        }

        self.url = url;

        function loadJson(url) {
          return new Promise( function(resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function() {
              resolve(xhr.response);
            }

            xhr.onerror = function() {
              reject(new Error('Some kind of network error, XHR failed.'))
            }

            xhr.open('GET', url);
            xhr.send();
          })
        };

        function propertyTest(currentObject) {
          for (var property in currentObject) {
            if (currentObject[property].hasOwnProperty('format')) {
              self.slices.push({
                name: property,
                properties: currentObject[property]
              })
            } else {
              propertyTest(currentObject[property]);
            }
          }
        }

        loadJson(url)
          .then(function(response) {
              return JSON.parse(response);
            }, function(err) {
              reject('Error parsing json');
            })
          .then(function(data) {
            propertyTest(data)

            var filtered = self.slices.filter(function(slice) {
              return (self.opts.exclude.indexOf(slice.name) === -1) ? true : false;
            });

            var slices = filtered.map(function(slice) {
              return self.makeMesh(slice);
            });

            resolve(slices)
          })

      })
    }

    
  }
  return new Sketch2three();
})();