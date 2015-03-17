var Utils = {};

Utils.shuffleArray = function(o) {
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

Utils.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Utils.getRandomArbitrary = function(min, max) {
  return Math.random() * (max - min) + min;
}

Utils.toRad = function(deg) {
  return deg * (Math.PI/180);
}

Utils.toDeg = function(rad) {
  return rad * (180/Math.PI);
}

Utils.xhr = function(url) {
  return new Promise( function(resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.onload = function() { resolve(xhr.response) }
    xhr.onerror = function() { reject(new Error('Some kind of network error, XHR failed.')) }

    xhr.open('GET', url);
    xhr.send();
  })
};


Utils.loadJson = function(url) {
  return new Promise(function(resolve,reject) {
    Utils.xhr(url)
      .then( function(response) {
        return JSON.parse(response)
      }, function(err) {
        reject(new Error('Error parsing JSON ' + err));
      })
      .then ( function(parsed) {
        return resolve(parsed);
      })
  });
}

Utils.querystring = (function() {
  var parameters = {};
  var parts = window.location.search.substr( 1 ).split( '&' );
  for ( var i = 0; i < parts.length; i ++ ) {
    var parameter = parts[ i ].split( '=' );
    parameters[ parameter[ 0 ] ] = parameter[ 1 ];
  }
  return parameters;
})();


// todo: three.js mesh destroy.   delete material, geoemtry and remove object from parent.   self remove from parent.
// todo: asset loader