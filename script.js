import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let prevTime = performance.now(); 

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, 0, -1), 0, 20);

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

camera.position.set(0,0,5);

const light = new THREE.AmbientLight( 0x404040 ,1); 
scene.add( light );

const controls = new PointerLockControls(camera, document.body);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const crosshair = document.getElementById('crosshair');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.querySelector('.progress-bar');

instructions.addEventListener('click', function () {
  controls.lock();
});
controls.addEventListener('lock', function () {
  instructions.style.display = 'none';
  blocker.style.display = 'none';
  crosshair.style.visibility = 'visible';
});
controls.addEventListener('unlock', function () {
  blocker.style.display = 'block';
  instructions.style.display = '';
  crosshair.style.visibility = 'hidden';
});

scene.add(controls.getObject());

const onKeyDown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
    case 'Space':
      if (canJump === true) velocity.y += 350;
      canJump = false;
      break;
  }
};
const onKeyUp = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};
loadingManager.onLoad = function () {
  console.log('Loading complete!');
  loadingScreen.style.display = 'none';
};
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressBar.style.width = progress + '%';
  progressBar.setAttribute('aria-valuenow', progress);
};
loadingManager.onError = function (url) {
  console.log('There was an error loading ' + url);
};

const loader = new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);

rgbeLoader.load('/Environments/environment1.hdr', function(texture){
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;

  loader.load( './showroom/scene.gltf', function ( gltf ) {
    scene.add(gltf.scene);
    scene.dispatchEvent({ type: 'loaded' });
    gltf.scene.scale.set(3, 3, 3);
  }, undefined, function ( error ) {
    console.error( error );
  } );

  for (var i = 1; i <= 4; i++) {
    table(-15, -1, (-30 + i * 15), 5);
    table(15, -1, (-30 + i * 15), 11);
    if (i === 1) {
      gun(-15, 4, (-30 + i * 15), 0.01, 1);
      gun(15, 4, (-30 + i * 15), 0.4, 2);
    } else if (i === 2) {
      gun(-15, 4, (-30 + i * 15), 0.4, 3);
      gun(15, 4, (-30 + i * 15), 4.5, 4);
    } else if (i === 3) {
      gun(-15, 4, (-30 + i * 15), 0.1, 5);
      gun(15, 4, (-30 + i * 15), 0.3, 6);
    } else {
      gun(-15, 4, (-30 + i * 15), 0.4, 7);
      gun(15, 4, (-30 + i * 15), 4.5, 8);
    }
  }
  counterTable(0, -1, -26, 2);
});

function table(x, y, z, r) {
  loader.load('./table/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
    scene.dispatchEvent({ type: 'loaded' });
    gltf.scene.position.set(x, y, z);
    gltf.scene.scale.set(0.02, 0.02, 0.02);
    gltf.scene.rotation.y = r * Math.PI / 6;
    console.log("hello");
  }, undefined, function (error) {
    console.error(error);
  });
  return;
}

function counterTable(x, y, z, r) {
  loader.load('./counter/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
    scene.dispatchEvent({ type: 'loaded' });
    gltf.scene.position.set(x, y, z);
    gltf.scene.scale.set(1.3, 1.3, 1.3);
    gltf.scene.rotation.y = r * Math.PI / 2;
    console.log("hello");
  }, undefined, function (error) {
    console.error(error);
  });
  return;
}

// Array to store references to gun objects
const guns = [];

// Function to load gun and add it to the scene
function gun(x, y, z, s, i) {
  loader.load('./guns/gun' + i + '/scene.gltf', function (gltf) {
    const gunObject = gltf.scene;
    scene.add(gunObject);
    scene.dispatchEvent({ type: 'loaded' });

    const gunY = y + 3; // Adjusted y-coordinate of gun position
    gunObject.position.set(x, gunY, z);
    gunObject.scale.set(s, s, s);

    // Store the reference to the gun object in the array
    guns.push(gunObject);
  }, undefined, function (error) {
    console.error(error);
  });
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize);

// Function to handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to animate the scene
function animate() {
  const time = performance.now();

  // If controls are locked, handle user movements and collisions
  if (controls.isLocked === true) {
    raycaster.ray.origin.copy(controls.getObject().position);
    raycaster.ray.origin.y += 10;
       
    const intersections = raycaster.intersectObjects(guns, false);
    const onObject = intersections.length > 0;
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 250.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 250.0 * delta;

    if (onObject === true) {
      console.log("hello++");
      velocity.y = Math.max(0, velocity.y);
      canJump = true;
    }

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += (velocity.y * delta);

    if (controls.getObject().position.y < 5) {
      velocity.y = 0;
      controls.getObject().position.y = 5;
      canJump = true;
    }
    if (controls.getObject().position.z > 35) {
      controls.getObject().position.z = 34;
    }
    if (controls.getObject().position.z < -35) {
      controls.getObject().position.z = -31;
    }
    if (controls.getObject().position.x > 8) {
      controls.getObject().position.x = 8;
    }
    if (controls.getObject().position.x < -8) {
      controls.getObject().position.x = -8;
    }
  }
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Rotate each gun
  guns.forEach(gunObject => {
    if (gunObject) {
      gunObject.rotation.x += 0.01;
      gunObject.rotation.y += 0.01;
    }
  });

  prevTime = time;
  renderer.render(scene, camera);
}

// Event listener for mouse clicks
document.addEventListener('pointerdown', function (event) {
  if (controls.isLocked === true) {
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const intersects = raycaster.intersectObjects(guns, true);

    if (intersects.length > 0) {
      const selectedGun = intersects[0].object;
      $('#gunModal').modal('show'); // Show the Bootstrap modal
	  controls.unlock();
	  document.getElementById('gunModal').addEventListener("click", function() {
		instructions.click();
	  });
      // Add your code here to handle the selection
    }
  }
});
