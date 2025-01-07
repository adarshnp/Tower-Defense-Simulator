import * as THREE from 'three';

//create a basic scene,camera,renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Add a simple grid
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);


// Create a plane for the map
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

// Camera Position
camera.position.set(10, 10, 10);
camera.lookAt(0, 0, 0);


//Tower Positions
const towers = [];

//Add Towers
function addTower(x, z) {
    const towerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const towerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(x, 0.5, z);
    towers.push(tower);
    scene.add(tower);
}

//Handle Mouse clicks to place towers
window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        addTower(Math.round(point.x), Math.round(point.z));
    }
});


//Animate the cube
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();