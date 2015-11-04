var camera, scene, renderer, effect;
var vrControls, deviceOrientation;
var sky, water;
var cameraPath;
var dolly;

var currentTime = null;
var startTime = null;
var gotime = null;
var speed = 20;

var colorTop = new THREE.Color(0xdc72aa);
var colorMiddle = new THREE.Color(0xfbdfd3);
var colorBottom = new THREE.Color(0xdc72aa);

function setupSound() {
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
};

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
};

function startAnimation() {
	onWindowResize();
	requestAnimationFrame(animate);
}

function animate(time) {
	requestAnimationFrame(animate);

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

	// set rendering and controls
	renderer.render(scene, camera);
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

	window.addEventListener('resize', onWindowResize, false);
}

init();
