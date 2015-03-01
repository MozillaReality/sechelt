


var VRUIKit = {};

VRUIKit.TextLabel = function(text, opts) {
  this.text = text;

  if (!opts) opts = {};
  this.width = opts.hasOwnProperty('width') ? opts.width : 1; // three js units
  this.height = opts.hasOwnProperty('height') ? opts.height : 0.2;


  // CSS Text format
  // Formal syntax: [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]? <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ] | caption | icon | menu | message-box | small-caption | status-bar
  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  var font = opts.hasOwnProperty('font') ? opts.font : 'normal 30px helvetica'; // pixels
  this.fontPosition = opts.hasOwnProperty('fontPosition') ? opts['fontPosition'] : { x: 0, y: 0 }; // three js units
  this.textBaseline = opts.hasOwnProperty('textBaseline') ? opts['textBaseline'] : 'alphabetic';
  this.textAlign = opts.hasOwnProperty('textAlign') ? opts['textAlign'] : 'start';
  this.verticalAlign = opts.hasOwnProperty('verticalAlign') ? opts['verticalAlign'] : 'top';
  this.lineHeight = opts.hasOwnProperty('lineHeight') ? opts['lineHeight'] : 30; // px
  this.fillStyle = opts.hasOwnProperty('color') ? opts['color'] : 'black';
  this.background = opts.hasOwnProperty('background') ? opts['background'] : null;

  var canvas = document.createElement('canvas');

  this.pixel2three = 1000;

  this.canvasWidth = this.width * this.pixel2three;
  this.canvasHeight = this.height * this.pixel2three;

  canvas.width = this.canvasWidth;
  canvas.height = this.canvasHeight;

  this.context = canvas.getContext('2d');
  this.context.font = font;

  this.texture = new THREE.Texture(canvas);

  this.set(text);

  var material = new THREE.MeshBasicMaterial({
    map: this.texture,
    transparent: true
  });

  var geometry = new THREE.PlaneGeometry( this.width, this.height, 10, 10 );

  this.mesh = new THREE.Mesh( geometry, material );

  return this;
}

VRUIKit.TextLabel.prototype.set = function(text) {
  var self = this;

  this.text = text;

  this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

  if (this.background) {
    this.context.fillStyle = this.background;
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  this.context.textAlign = this.textAlign;

  var textLines = this.text.split('\n');

  var x, y;

  if (this.textAlign == 'center') {
    x = this.fontPosition.x + (this.canvasWidth/2);
  } else {
    x = this.fontPosition.x;
  }

  if (this.verticalAlign === 'top') {
    y = this.fontPosition.y + this.lineHeight;
  } else if (this.verticalAlign === 'middle') {
    y = (this.canvasHeight/2) - ((this.lineHeight * textLines.length) / 2) + this.lineHeight;
  }

  this.context.textBaseline = this.textBaseline;

  textLines.forEach(function(textLine, i) {
    self.context.fillStyle = self.fillStyle;
    self.context.fillText(textLine, x, y + (self.lineHeight * i));
  });

  this.texture.needsUpdate = true;
}


VRUIKit.scaleMesh = function(mesh, scale) {
  mesh.scale.x *= scale;
  mesh.scale.y *= scale;
}


VRUIKit.makeFrame = function( width, height, depth, renderWidth, renderHeight, renderDepth, thickness, color, opacity ){
  var   w = width,
        h = height,
        d = depth,
        t = thickness,
        c = color,
        o = opacity;

  var group = new THREE.Group();
  var material = new THREE.MeshBasicMaterial( { color: c, transparent: true, opacity: o } );

  if( renderDepth ){

    var geometry = new THREE.CubeGeometry( t, t, d, 1, 1, 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, d/2 ) );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0+w/2, 0+h/2, 0-d/2 );
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0+w/2, 0-h/2, 0-d/2 );
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0-h/2, 0-d/2 );
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0+h/2, 0-d/2 );
    group.add( mesh );

  }

  if( renderWidth ){

    var geometry = new THREE.CubeGeometry( t, t, w, 1, 1, 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, w/2 ) );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0+h/2, 0+d/2 );
    mesh.rotation.set( 0, 0.5*Math.PI, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0-h/2, 0+d/2 );
    mesh.rotation.set( 0, 0.5*Math.PI, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0-h/2, 0-d/2 );
    mesh.rotation.set( 0, 0.5*Math.PI, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0+h/2, 0-d/2 );
    mesh.rotation.set( 0, 0.5*Math.PI, 0);
    group.add( mesh );

  }

  if( renderHeight ){

    var geometry = new THREE.CubeGeometry( t, t, h, 1, 1, 1 );
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, h/2 ) );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0+h/2, 0+d/2 );
    mesh.rotation.set( 0.5*Math.PI, 0, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0-w/2, 0+h/2, 0-d/2 );
    mesh.rotation.set( 0.5*Math.PI, 0, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0+w/2, 0+h/2, 0+d/2 );
    mesh.rotation.set( 0.5*Math.PI, 0, 0);
    group.add( mesh );

    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set( 0+w/2, 0+h/2, 0-d/2 );
    mesh.rotation.set( 0.5*Math.PI, 0, 0);
    group.add( mesh );

  }

  return group;
}

VRUIKit.makeCurvedPlane = function( width, height, radius, color ) {
  var C = 2 * Math.PI * radius;
  var thetaLength = (Math.PI*2) * (width/C);

  var g = new THREE.CylinderGeometry(
    radius, // radius top
    radius, // radius bottom
    height, // height
    10, // y segments
    10, // x segments
    true, // openended
    0,  // theta start
    thetaLength
  );

  g.applyMatrix( new THREE.Matrix4().makeScale(1, 1, -1));

  var m = new THREE.MeshBasicMaterial( {
    color: color,
    side: THREE.FrontSide
  } );

  return new THREE.Mesh( g, m );

}


//make border
  //makes flat cylindrical "outline" planes that face the user
VRUIKit.makeBorder = function( radius, height, thickness, thetaStart, thetaLength, y, color, opacity ) {
  var sideGeometry = new THREE.PlaneGeometry( thickness, height+thickness, 1, 1 );
  var material = new THREE.MeshBasicMaterial( {
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity
  } );

  var top = VRUIKit.makeBand( radius, thickness, thetaStart, thetaLength, 0+height/2, color, opacity );
  var bottom = VRUIKit.makeBand( radius, thickness, thetaStart, thetaLength, 0-height/2, color, opacity );

  var left = new THREE.Mesh( sideGeometry, material );
  left.position.set( 0, 0-thickness/2, radius );
  var leftPivot = new THREE.Object3D();
  leftPivot.rotation.set( 0, thetaStart*Math.PI/180, 0 );
  leftPivot.add( left );

  var right = new THREE.Mesh( sideGeometry, material );
  right.position.set( 0, 0-thickness/2, radius );
  var rightPivot = new THREE.Object3D();
  rightPivot.rotation.set( 0, (thetaStart-thetaLength)*Math.PI/180, 0 );
  rightPivot.add( right );

  var border = new THREE.Object3D();
  border.add( top );
  border.add( bottom );
  border.add( leftPivot );
  border.add( rightPivot );

  return border;
}


VRUIKit.makeBand = function( radius, height, thetaStart, thetaLength, y, color, opacity, flipNormals ) {

  var radiusSegments = thetaLength / 2;
  var heightSegments = 1;

  var length = thetaLength * Math.PI/180;

  var start;

  if (flipNormals) {
    start = (thetaStart + 180) * Math.PI/180; //subtracting length from start has effect of enabling designer to specify left edge position of the band (start), and extending band rightwards.
  } else {
    start = (thetaStart - thetaLength) * Math.PI/180;
  }

  var geometry = new THREE.CylinderGeometry( radius, radius, height, radiusSegments, heightSegments, true, start, length );

  if (flipNormals)  {
    geometry.applyMatrix( new THREE.Matrix4().makeScale(-1, 1, 1));
  }

  geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0-height/2, 0 ) ); //sets pivot to top of band

  var material = new THREE.MeshBasicMaterial( {
    color: color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: opacity
  } );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.setY( y );

  return mesh;
}

