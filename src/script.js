import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 400 });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Galaxy
 */
const parameters = {
  count: 1000,
  size: 0.02,
  radius: 4,
  branches: 3,
  spin: 0.2,
  randomness: 0.2,
  insideColor: "#ff0000",
  outsideColor: "#0000ff",
  rotate: 0
};
let geom, material, points;

function generateGalaxy() {
  // Dispose old geoms
  if (points) {
    geom.dispose();
    material.dispose();
    scene.remove(points);
  }

  // Geometry
  geom = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  const inColor = new THREE.Color(parameters.insideColor);
  const outColor = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    // Position
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const spinAngle = parameters.spin * radius;
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    const randomX = (Math.random() - 0.5) * parameters.randomness;
    const randomY = (Math.random() - 0.5) * parameters.randomness;
    const randomZ = (Math.random() - 0.5) * parameters.randomness;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = inColor.clone();
    mixedColor.lerp(outColor, radius / parameters.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // Material
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true
  });

  // Points
  points = new THREE.Points(geom, material);
  scene.add(points);
}

generateGalaxy();

// Tweaks
gui
  .add(parameters, "count", 100, 100000, 100)
  .name("Total stars")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "size", 0.001, 0.1, 0.001)
  .name("Star size")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "radius", 1, 20, 1)
  .name("Branch distance")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "branches", 3, 20, 1)
  .name("Total branches")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "spin", -3, 3, 0.001)
  .name("Branch spin")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "randomness", 0, 2, 0.01)
  .name("Branch thickness")
  .onFinishChange(generateGalaxy);
gui
  .addColor(parameters, "insideColor")
  .name("In-colour")
  .onFinishChange(generateGalaxy);
gui
  .addColor(parameters, "outsideColor")
  .name("Out-colour")
  .onFinishChange(generateGalaxy);
gui
  .add(parameters, "rotate", -5, 5, 0.1)
  .name("Spin speed")
  .onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  // Update controls
  controls.update();

  // Rotate galaxy
  points.rotation.y = -elapsedTime * parameters.rotate;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
