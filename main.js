import * as THREE from 'three';

//create a basic scene,camera,renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);


//set camera position
camera.position.z = 5;

//Animate the cube
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate();