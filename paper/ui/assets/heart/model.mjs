import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// This is the original segmented HRA mesh, not a procedurally drawn heart.
export async function createHeartViewer(host, onSelect) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.65;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .01, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = .07;
  controls.minDistance = 2.5;
  controls.maxDistance = 10;
  controls.autoRotateSpeed = .6;
  controls.enablePan = false;
  scene.add(new THREE.HemisphereLight(0xfff8e8, 0x42534c, 2.5));
  const key = new THREE.DirectionalLight(0xffe0ce, 4.2);
  key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xebf3da, 3.5);
  rim.position.set(3, 1, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc3dddc, 1.5);
  fill.position.set(-3, -2, 0); scene.add(fill);
  const gltf = await new GLTFLoader().loadAsync(new URL('./heart.glb', import.meta.url).href);
  const organ = gltf.scene;
  const originalBox = new THREE.Box3().setFromObject(organ);
  const center = originalBox.getCenter(new THREE.Vector3());
  const scale = 2.65 / originalBox.getSize(new THREE.Vector3()).length();
  organ.position.copy(center).multiplyScalar(-1);
  const group = new THREE.Group();
  group.add(organ); group.scale.setScalar(scale); scene.add(group);
  const meshes = [];
  const colors = {left_ventricle:0xbb6253,right_ventricle:0x7796ac,left_cardiac_atrium:0xc98977,right_cardiac_atrium:0x92b2bf,interventricular_septum:0xb48b79};
  organ.traverse(mesh => {
    if (!mesh.isMesh) return;
    mesh.userData.structure = mesh.name.replace(/^VH_F_/, '');
    mesh.userData.baseColor = colors[mesh.userData.structure] ?? (mesh.name.includes('valve') ? 0xd6bf88 : 0xe3a189);
    mesh.material = new THREE.MeshStandardMaterial({color:mesh.userData.baseColor,roughness:.5,metalness:.02,side:THREE.DoubleSide});
    meshes.push(mesh);
  });
  let selection = 'all', opacity = 1, isolated = false, colorized = true, cut = 0, disposed = false;
  const clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 2);
  const match = mesh => selection === 'all' || mesh.userData.structure.includes(selection);
  function updateMaterials() {
    for (const mesh of meshes) {
      const selected = selection !== 'all' && match(mesh);
      mesh.visible = !isolated || match(mesh);
      mesh.material.color.setHex(colorized ? mesh.userData.baseColor : 0xb46a60);
      mesh.material.emissive.setHex(selected ? 0x51340b : 0x000000);
      mesh.material.emissiveIntensity = selected ? .65 : 0;
      mesh.material.opacity = selected ? 1 : opacity;
      mesh.material.transparent = mesh.material.opacity < 1;
      mesh.material.depthWrite = !mesh.material.transparent;
      mesh.material.clippingPlanes = cut > 0 ? [clippingPlane] : [];
      mesh.material.needsUpdate = true;
    }
  }
  function view(name) {
    controls.autoRotate = false;
    group.rotation.set(0,0,0);
    const positions = {anterior:[0,.2,5.4],posterior:[0,.2,-5.4],superior:[0,5.4,.05]};
    camera.position.set(...(positions[name] || positions.anterior));
    camera.up.set(0,1,0); controls.target.set(0,0,0); controls.update();
  }
  view('anterior');
  const resize = new ResizeObserver(() => {
    const {width,height} = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width,height); camera.aspect = width / height; camera.updateProjectionMatrix();
  });
  resize.observe(host);
  const pointer = new THREE.Vector2(), ray = new THREE.Raycaster();
  let down;
  renderer.domElement.addEventListener('pointerdown', e => {down = [e.clientX,e.clientY];});
  renderer.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX-down[0],e.clientY-down[1]) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    ray.setFromCamera(pointer,camera);
    const hit = ray.intersectObjects(meshes).find(h => h.object.visible && h.object.material.opacity > .2 && (!cut || clippingPlane.distanceToPoint(h.point) >= 0));
    if (hit) onSelect(hit.object.userData.structure.includes('papillary_muscle') ? 'papillary_muscle' : hit.object.userData.structure);
  });
  const render = () => {
    if (disposed) return;
    requestAnimationFrame(render);
    if (document.hidden || !host.getBoundingClientRect().width) return;
    controls.update(); renderer.render(scene,camera);
  };
  render();
  return {
    select(value) {selection = value; updateMaterials();},
    setOpacity(value) {opacity = value; updateMaterials();},
    isolate(value) {isolated = value; updateMaterials();},
    colorize(value) {colorized = value; updateMaterials();},
    cutaway(value) {cut = value; clippingPlane.constant = 1.3 - value / 100 * 2.4; updateMaterials();},
    rotate(value) {controls.autoRotate = value;},
    view,
    reset() {selection='all';opacity=1;isolated=false;colorized=true;cut=0;view('anterior');updateMaterials();},
    dispose() {disposed=true;resize.disconnect();controls.dispose();meshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});renderer.dispose();}
  };
}
