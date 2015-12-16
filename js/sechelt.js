var camera, scene, renderer, effect;
var vrControls;
var sky, water;
var cameraPath;
var dolly;

var currentTime = null;
var startTime = null;
var gotime = null;
var speed = 20;
var vrMode = false;

var colorTop = new THREE.Color(0xdc72aa);
var colorMiddle = new THREE.Color(0xfbdfd3);
var colorBottom = new THREE.Color(0xdc72aa);

var isMobile = function () {
  var check = false;
  (function (a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};

var getUrlParameter = function (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function setupSound() {
  var qsSound = getUrlParameter('sound');
  if (qsSound === '0' || qsSound === 'off' || qsSound === 'false') {
    return;
  }

  var listener = new THREE.AudioListener();
  camera.add(listener);

  var sound = new THREE.Audio(listener);
  sound.load('sounds/78389__inchadney__seagulls.ogg');
  sound.position.set(475, 50, 850);
  sound.setLoop(true);
  sound.setRefDistance(100);
  sound.autoplay = true;
  scene.add(sound);

  var sound = new THREE.Audio(listener);
  sound.load('sounds/23707__hazure__seagull.ogg');
  sound.position.set(10, 50, -200);
  sound.setLoop(true);
  sound.setRefDistance(100);
  sound.autoplay = true;
  scene.add(sound);

  var sound = new THREE.Audio(listener);
  sound.load('sounds/235428__allanz10d__calm-ocean-breeze-simulation.ogg');
  sound.position.set(-30, 0, -750);
  sound.setLoop(true);
  sound.setRefDistance(100);
  sound.autoplay = true;
  scene.add(sound);
}

function setupSkybox() {
  var geometry = new THREE.SphereGeometry(10000, 64, 32);
  var vertices = geometry.vertices;
  var faces = geometry.faces;

  for (var i = 0, l = faces.length; i < l; i++) {
    var face = faces[i];
    var vertex1 = vertices[face.a];
    var vertex2 = vertices[face.b];
    var vertex3 = vertices[face.c];

    var color1 = colorMiddle.clone();
    color1.lerp(vertex1.y > 0 ? colorTop : colorBottom, Math.abs(vertex1.y) / 6000);

    var color2 = colorMiddle.clone();
    color2.lerp(vertex2.y > 0 ? colorTop : colorBottom, Math.abs(vertex2.y) / 6000);

    var color3 = colorMiddle.clone();
    color3.lerp(vertex3.y > 0 ? colorTop : colorBottom, Math.abs(vertex3.y) / 6000);

    face.vertexColors.push(color1, color2, color3);
  }

  var material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    map: new THREE.TextureLoader().load('images/bg-2.png')
  });

  sky = new THREE.Mesh(geometry, material);
  scene.add(sky);
}

function setupWaves() {
  var geometry = new THREE.Geometry();
  var vertices = geometry.vertices;
  var faces = geometry.faces;
  var vector = new THREE.Vector3();

  for (var i = 0; i < 10000; i++) {
    vector.x = Math.random() * 40000 - 20000;
    vector.z = Math.random() * 40000 - 20000;

    var size = Math.random() * 10 + 1;
    var angle = Math.random() * Math.PI;

    var vertex1 = vector.clone();
    vertex1.x += size * Math.cos(angle);
    vertex1.z += size * Math.sin(angle);

    angle -= 2;

    var vertex2 = vector.clone();
    vertex2.x += size * Math.cos(angle);
    vertex2.z += size * Math.sin(angle);

    angle -= 2;

    var vertex3 = vector.clone();
    vertex3.x += size * Math.cos(angle);
    vertex3.z += size * Math.sin(angle);

    var a = vertices.push(vertex1) - 1;
    var b = vertices.push(vertex2) - 1;
    var c = vertices.push(vertex3) - 1;

    faces.push(new THREE.Face3(a, b, c));
  }

  var material = new THREE.MeshBasicMaterial({
    opacity: 0.4,
    transparent: true
  })

  var mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 2.5;
  mesh.renderOrder = 1;
  scene.add(mesh);
}

function setupWater() {
  var geometry = new THREE.PlaneBufferGeometry(100000, 100000);
  var material = new THREE.MeshBasicMaterial({
    color: colorMiddle,
    opacity: 0.75,
    transparent: true
  });
  water = new THREE.Mesh(geometry, material);
  water.position.y = 0;
  water.rotation.x = -Math.PI / 2;
  water.renderOrder = 2;
  scene.add(water);
}

function setupLights() {
  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
  directionalLight.position.set(-1, 1, -1);
  scene.add(directionalLight);

  var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
  hemisphereLight.position.set(-1, 2, 1.5);
  scene.add(hemisphereLight);
}

function onModelLoaded(model) {
  // clone and flip objects for reflection.
  reflectObjects = ['land', 'island', 'rocks', 'trees'];

  reflectObjects.forEach(function(name) {
    var object = model.getObjectByName(name).children[0];
    var reflection = new THREE.Mesh(object.geometry, object.material.clone());
    reflection.material.side = THREE.BackSide;
    reflection.position.y = 0;
    reflection.scale.y = -1;
    object.parent.add(reflection);
  });

  scene.add(model);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function startAnimation() {
  onWindowResize();
  requestAnimationFrame(animate);
}

function animate(time) {
  if (cameraPath !== undefined) {
    if (!startTime) startTime = time;
    if (!currentTime) currentTime = time;

    currentTime += speed;
    gotime = TWEEN.Easing.Sinusoidal.InOut(Math.min(currentTime / 70000, 1)) * 0.9999;

    var pointA = cameraPath.getPointAt(gotime);
    var pointB = cameraPath.getPointAt(Math.min(gotime + 0.0001, 1));

    pointA.z = -pointA.z;
    pointB.z = -pointB.z;

    dolly.position.copy(pointA);
    dolly.lookAt(pointB);
    dolly.rotateY(Math.PI); // look forward
  }

  // move sky and water position with camera dolly
  sky.position.copy(dolly.position);

  water.position.x = dolly.position.x;
  water.position.z = dolly.position.z;

  if (vrMode) {
    effect.render(scene, camera);
  }  else {
    renderer.render(scene, camera);
  }
  vrControls.update();

  requestAnimationFrame(animate);
}

function requestFullscreen() {
  var el = renderer.domElement;

  if (!isMobile()) {
    effect.setFullScreen(true);
    return;
  }

  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if (vrMode) {
    effect.setSize(window.innerWidth, window.innerHeight);
  } else {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function onFullscreenChange(e) {
  var fsElement = document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement;

  if (!fsElement) {
    vrMode = false;
  } else {
    // lock screen if mobile
    window.screen.orientation.lock('landscape');
  }
}

function init() {
  // setup renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.autoClear = false;
  renderer.setClearColor(0x404040);
  document.body.appendChild(renderer.domElement);

  // setup scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcacfde, 0, 10000);

  // setup dolly that camera rides on.
  dolly = new THREE.Group();
  dolly.position.set(10000, 10000, 10000);
  scene.add(dolly);

  // setup camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.z = 0.0001;
  dolly.add(camera);

  // Scene elements
  setupSkybox();
  setupWaves();
  setupWater();
  setupSound();
  setupLights();

  // load scene
  var loader = new THREE.ObjectLoader();
  loader.load('models/scene-nov4.json', onModelLoaded)

  // load camera path
  var loader = new THREE.C4DCurveLoader();
  loader.load('models/flightpath-nov4-bezier.txt', function(curve) {
    cameraPath = curve.toLinearCurve(1); // 1 = distance between points
    startAnimation();
  });

  // effect and controls for VR
  effect = new THREE.VREffect(renderer);
  vrControls = new THREE.VRControls(camera);

  window.addEventListener('resize', onWindowResize, false);
}

document.querySelector('#enterVr').addEventListener('click', function() {
  vrMode = vrMode ? false : true;
  requestFullscreen();
  onWindowResize();
});

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
window.addEventListener('resize', onWindowResize, false );

init();
