// ---------- בסיס ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);

// ---------- שלבים ----------
const stages = [
  { width: 30, length: 200, color: 0x555555 },
  { width: 40, length: 250, color: 0x4444aa },
  { width: 25, length: 180, color: 0x228822 }
];

let stageIndex = 0;
let track, finishLine;
let trackData;

// ---------- יצירת שלב ----------
function createStage(index) {
  if (track) scene.remove(track);
  if (finishLine) scene.remove(finishLine);

  trackData = stages[index];

  track = new THREE.Mesh(
    new THREE.BoxGeometry(trackData.width, 1, trackData.length),
    new THREE.MeshStandardMaterial({ color: trackData.color })
  );
  track.position.z = -trackData.length / 2;
  scene.add(track);

  finishLine = new THREE.Mesh(
    new THREE.BoxGeometry(trackData.width, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0xffff00 })
  );
  finishLine.position.set(0, 1, -trackData.length + 5);
  scene.add(finishLine);

  player.position.set(0, 1, 0);
}

const player = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 4),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
player.position.y = 1;
scene.add(player);

createStage(stageIndex);

// ---------- שליטה ----------
const keys = {};
addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ---------- מצלמה מסתובבת ----------
let camAngle = 0;
let isDragging = false;

addEventListener("mousedown", () => isDragging = true);
addEventListener("mouseup", () => isDragging = false);
addEventListener("mousemove", e => {
  if (isDragging) camAngle -= e.movementX * 0.005;
});

// ---------- תנועה ----------
const speed = 0.6;

function movePlayer() {
  if (keys["w"]) player.position.z -= speed;
  if (keys["s"]) player.position.z += speed;
  if (keys["a"]) player.position.x -= speed;
  if (keys["d"]) player.position.x += speed;

  // גבולות מפה
  const halfW = trackData.width / 2 - 1;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -halfW, halfW);
  player.position.z = THREE.MathUtils.clamp(
    player.position.z,
    -trackData.length + 5,
    5
  );

  // בדיקת קו סיום
  if (player.position.z <= finishLine.position.z) {
    stageIndex = (stageIndex + 1) % stages.length;
    createStage(stageIndex);
  }
}

// ---------- מצלמה ----------
function updateCamera() {
  const radius = 15;
  camera.position.x = player.position.x + Math.sin(camAngle) * radius;
  camera.position.z = player.position.z + Math.cos(camAngle) * radius;
  camera.position.y = 10;
  camera.lookAt(player.position);
}

// ---------- לולאה ----------
function animate() {
  requestAnimationFrame(animate);
  movePlayer();
  updateCamera();
  renderer.render(scene, camera);
}
animate();

// ---------- Resize ----------
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
