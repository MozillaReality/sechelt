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