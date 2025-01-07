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

//Enemy Path
const pathPoints = [
    new THREE.Vector3(-9, 0, -9),
    new THREE.Vector3(0, 0, -9),
    new THREE.Vector3(0, 0, 9),
    new THREE.Vector3(9, 0, 9),
  ];

let enemies = [];

//Spawn Enemies
function spawnEnemy(){
    const enemyGeometry = new THREE.SphereGeometry(0.3,8,8);
    const enemyMaterial = new THREE.MeshBasicMaterial({color:0xff0000});
    const enemy = new THREE.Mesh(enemyGeometry,enemyMaterial);
    enemy.position.copy(pathPoints[0]);
    enemy.pathIndex = 0;
    enemies.push(enemy);
    scene.add(enemy);
}

setInterval(spawnEnemy,2000);//spawn enemy every 2 seconds

//Move Enemies
function moveEnemies(speed){
    enemies = enemies.filter((enemy)=>{
        const target = pathPoints[enemy.pathIndex + 1];
        if(!target){
            scene.remove(enemy);
            return false;// remove enemy becoz it reached the end
        }
        const direction = new THREE.Vector3().subVectors(target,enemy.position).normalize();
        enemy.position.add(direction.multiplyScalar(speed));
        if(enemy.position.distanceTo(target) < 0.1){
            enemy.pathIndex++;
        }
        return true;
    });
}

//Animate the cube
function animate() {
    requestAnimationFrame(animate);
    moveEnemies(0.05);
    renderer.render(scene, camera);
}
animate();