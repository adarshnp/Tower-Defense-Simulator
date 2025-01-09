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

//Tower class with shooting ability
class Tower {
    constructor(x, z) {
        this.geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(x, 0.5, z);
        this.range = 5;
        this.damage = 10;
        this.target = null;
        this.cooldown = 0;
        this.cooldownTime = 1;
    }


    //Find target within range
    findTarget(enemies) {
        this.target = null;
        for (let enemy of enemies) {
            if (this.mesh.position.distanceTo(enemy.mesh.position) <= this.range) {
                this.target = enemy;
                break;
            }
        }
    }

    //Shoot at the target
    shoot() {
        if (this.target) {
            shootBullet(this, this.target);
        }
    }

    //Update towers actions
    update(enemies) {

        if (this.cooldown > 0) {
            this.cooldown -= 0.016; // Decrease cooldown (about 60 FPS)
            return;  
        }

        this.findTarget(enemies);
        if (this.target) {
            this.shoot();
            this.cooldown = this.cooldownTime;
        }
    }
}

//Create towers array and place arrays
let towers = [];

//Add Towers
function addTower(x, z) {
    const tower = new Tower(x, z);
    towers.push(tower);
    scene.add(tower.mesh);
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

//Handle Mouse right clicks to delete towers
window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(towers.map(tower=>tower.mesh));
    if (intersects.length > 0) {
        const selectedTowerMesh = intersects[0].object;
        const towerIndex = towers.findIndex(tower=>tower.mesh == selectedTowerMesh);
        if(towerIndex > -1){
            scene.remove(selectedTowerMesh);
            towers.splice(towerIndex,1);
        }
    }
});
//Enemy Path
const pathPoints = [
    new THREE.Vector3(-9, 0.5, -9),
    new THREE.Vector3(0, 0.5, -9),
    new THREE.Vector3(0, 0.5, 9),
    new THREE.Vector3(9, 0.5, 9),
];

//Enemy class with health
class Enemy{
    constructor(position){
        this.geometry = new THREE.SphereGeometry(0.3, 8, 8);
        this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);
        this.pathIndex = 0;
        this.health = 100;
        this.healthBar = createHealthBar(this);
    }

    //move enemy along the path
    move(pathPoints){
        if (this.health <= 0) return false;
        const target = pathPoints[this.pathIndex + 1];
        if(!target){
            return false;
        }
        const direction = new THREE.Vector3().subVectors(target,this.mesh.position).normalize();
        this.mesh.position.add(direction.multiplyScalar(0.05));
        this.healthBar.position.copy(this.mesh.position).add(new THREE.Vector3(0, 0.5, 0));

        if(this.mesh.position.distanceTo(target) < 0.1){
            this.pathIndex++;
        }
        return true;
    }

    //check if enemy is hit
    takeDamage(amount){
        this.health -= amount;
        const percentage = Math.max(0, this.health / 100);
        this.healthBar.scale.set(percentage, 1, 1);
        if(this.health <= 0){
            scene.remove(this.mesh);
            scene.remove(this.healthBar);
            return false;
        }
        return true;
    }
}

let enemies = [];

//Spawn Enemies
function spawnEnemy() {
    const enemy = new Enemy(pathPoints[0]);
    enemies.push(enemy);
    scene.add(enemy.mesh);
    const healthBar = createHealthBar(enemy);
    enemy.healthBar = healthBar;
}

setInterval(spawnEnemy, 2000);//spawn enemy every 2 seconds

//Move Enemies
function moveEnemies() {
    enemies = enemies.filter((enemy) => enemy.move(pathPoints));
}

//Bullet Animation
function shootBullet(tower, enemy) {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

    bullet.position.copy(tower.mesh.position);
    scene.add(bullet);

    // Animate bullet
    const speed = 0.2;
    const animateBullet = () => {
        const direction = new THREE.Vector3().subVectors(enemy.mesh.position, bullet.position).normalize();
        bullet.position.add(direction.multiplyScalar(speed));

        // Check if bullet hit enemy
        if (bullet.position.distanceTo(enemy.mesh.position) < 0.2) {
            const hit = enemy.takeDamage(tower.damage);
            if (!hit) {
                tower.target = null;
                enemies = enemies.filter(item => item !== enemy);
            }
            scene.remove(bullet);
        } else {
            requestAnimationFrame(animateBullet);
        }
    };
    animateBullet();
}
let score = 0;
function updateScore(){
    score++;
    document.getElementById('score').innerText = `Score : ${score}`;
}

// Create health bar (on enemy destruction)
function createHealthBar(enemy) {
    const healthBarGeometry = new THREE.PlaneGeometry(0.5, 0.1);
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
    healthBar.position.set(enemy.mesh.position.x, enemy.mesh.position.y + 0.5, enemy.mesh.position.z);
    scene.add(healthBar);
    return healthBar;
  }


//Animate the cube
function animate() {
    requestAnimationFrame(animate);
    moveEnemies();
    towers.forEach(tower => tower.update(enemies));
    updateScore();
    renderer.render(scene, camera);
}
animate();