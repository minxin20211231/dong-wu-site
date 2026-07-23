import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mapCameraPoses } from '../../data/mapCameraPoses';
import type { PhaseStationScene, SceneKind } from './phases/types';

export type MapSceneController = {
  loadPhase: (phase: 1 | 2 | 3 | 4) => Promise<void>;
  setProgress: (progress: number) => void;
  setActiveStation: (stationId: string) => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
};

const COLORS = {
  deep: 0x1c1815,
  ink: 0x3a2e26,
  gold: 0xb8977e,
  orange: 0xd4886a,
  oat: 0xefe6da,
  milk: 0xd9c4ab,
  paper: 0xfffdf8,
  plywood: 0xcaa87f,
  brick: 0xb96f52,
  blue: 0x567f8f,
  red: 0x9e5347,
  sage: 0x78816d,
};

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function material(color: number, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0.02,
    ...options,
  });
}

function roundedBox(
  width: number,
  height: number,
  depth: number,
  color: number,
  radius = 0.12,
  options: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  const geometry = new RoundedBoxGeometry(width, height, depth, 4, Math.min(radius, width / 4, height / 4, depth / 4));
  const mesh = new THREE.Mesh(geometry, material(color, options));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(radius: number, color: number, options: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), material(color, options));
  mesh.castShadow = true;
  return mesh;
}

function cylinder(radius: number, height: number, color: number, radialSegments = 16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, radialSegments), material(color));
  mesh.castShadow = true;
  return mesh;
}

function addBox(group: THREE.Group, size: [number, number, number], position: [number, number, number], color: number, radius = 0.08) {
  const mesh = roundedBox(size[0], size[1], size[2], color, radius);
  mesh.position.set(...position);
  group.add(mesh);
  return mesh;
}

function makeFigure(color = COLORS.orange, hardHat = false) {
  const figure = new THREE.Group();
  const body = roundedBox(0.42, 0.72, 0.32, color, 0.13);
  body.position.y = 0.55;
  const head = sphere(0.23, 0xd9aa86);
  head.position.y = 1.1;
  const hair = sphere(0.235, COLORS.ink);
  hair.scale.set(1, 0.45, 1);
  hair.position.y = 1.22;
  const legA = cylinder(0.07, 0.38, COLORS.deep, 10);
  const legB = legA.clone();
  legA.position.set(-0.12, 0.15, 0);
  legB.position.set(0.12, 0.15, 0);
  figure.add(body, head, hair, legA, legB);
  if (hardHat) {
    const hat = sphere(0.26, COLORS.gold);
    hat.scale.set(1.12, 0.34, 1.05);
    hat.position.y = 1.35;
    figure.add(hat);
  }
  return figure;
}

function addRoomShell(group: THREE.Group, wallColor = COLORS.milk) {
  addBox(group, [3.4, 0.18, 2.75], [0, 0.34, 0], COLORS.paper, 0.05);
  addBox(group, [3.4, 1.75, 0.16], [0, 1.18, -1.3], wallColor, 0.04);
  addBox(group, [0.16, 1.75, 2.75], [-1.62, 1.18, 0], wallColor, 0.04);
}

function addBeam(group: THREE.Group, from: [number, number, number], to: [number, number, number], color: number, width = 0.08) {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const direction = b.clone().sub(a);
  const mesh = cylinder(width, direction.length(), color, 10);
  mesh.position.copy(a.clone().add(b).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
  return mesh;
}

function buildInspection(group: THREE.Group) {
  addRoomShell(group, 0xcabdb0);
  const figure = makeFigure(COLORS.orange);
  figure.position.set(0.45, 0.38, 0.25);
  figure.rotation.y = -0.45;
  group.add(figure);
  addBeam(group, [0.7, 0.78, 0.05], [1.28, 1.02, -0.7], COLORS.ink, 0.035);
  addBeam(group, [0.42, 1.05, -1.2], [0.58, 1.32, -1.2], COLORS.ink, 0.018);
  addBeam(group, [0.58, 1.32, -1.2], [0.48, 1.47, -1.2], COLORS.ink, 0.018);
}

function buildNeeds(group: THREE.Group) {
  addRoomShell(group);
  const figure = makeFigure(COLORS.gold);
  figure.position.set(-0.2, 0.38, 0.2);
  group.add(figure);
  const bubblePositions: [number, number, number, number][] = [
    [-1.0, 1.45, -0.4, 0.34], [-0.35, 1.85, -0.75, 0.3], [0.45, 1.72, -0.65, 0.37], [1.08, 1.35, -0.5, 0.28],
  ];
  bubblePositions.forEach(([x, y, z, r], index) => {
    const bubble = sphere(r, index % 2 ? COLORS.paper : COLORS.oat, { transparent: true, opacity: 0.9 });
    bubble.position.set(x, y, z);
    group.add(bubble);
  });
}

function buildDrawing(group: THREE.Group) {
  addBox(group, [3.5, 0.18, 2.8], [0, 0.34, 0], COLORS.oat, 0.05);
  addBox(group, [2.3, 0.18, 1.25], [-0.45, 0.95, 0.45], COLORS.plywood, 0.05);
  addBox(group, [1.55, 0.025, 0.86], [-0.45, 1.06, 0.43], COLORS.paper, 0.01);
  const house = new THREE.Group();
  addBox(house, [1.45, 0.9, 0.08], [0, 0.46, -0.62], COLORS.orange, 0.02);
  addBox(house, [0.08, 0.9, 1.3], [-0.68, 0.46, 0], COLORS.orange, 0.02);
  addBox(house, [1.45, 0.08, 1.3], [0, 0.06, 0], COLORS.orange, 0.02);
  house.position.set(0.7, 0.75, -0.2);
  house.scale.set(0.78, 0.78, 0.78);
  house.userData.motion = 'reveal';
  group.add(house);
  const figure = makeFigure(COLORS.sage);
  figure.position.set(-1.1, 0.38, 0.1);
  figure.rotation.y = 0.65;
  group.add(figure);
}

function buildContract(group: THREE.Group) {
  addBox(group, [3.6, 0.18, 2.8], [0, 0.34, 0], COLORS.oat, 0.05);
  addBox(group, [2.6, 0.2, 0.95], [0, 0.94, 0], COLORS.plywood, 0.06);
  const left = makeFigure(COLORS.orange);
  const right = makeFigure(COLORS.deep);
  left.position.set(-0.85, 0.38, 0.72);
  right.position.set(0.85, 0.38, -0.72);
  left.rotation.y = Math.PI;
  group.add(left, right);
  const calculator = addBox(group, [0.56, 0.1, 0.75], [0.75, 1.1, 0], COLORS.deep, 0.06);
  calculator.rotation.y = -0.12;
  const stamp = cylinder(0.16, 0.34, COLORS.orange, 14);
  stamp.position.set(-0.25, 1.28, 0.02);
  stamp.userData.motion = 'stamp';
  group.add(stamp);
}

function buildProtection(group: THREE.Group) {
  addBox(group, [3.7, 0.2, 2.9], [0, 0.34, 0], COLORS.milk, 0.05);
  for (let index = -2; index <= 2; index += 1) {
    const board = addBox(group, [0.64, 0.06, 2.45], [index * 0.7, 0.49, 0], COLORS.plywood, 0.015);
    board.rotation.y = index % 2 ? 0.015 : -0.01;
  }
  for (let index = -2; index <= 1; index += 1) addBox(group, [0.045, 0.02, 2.5], [index * 0.7 + 0.35, 0.535, 0], COLORS.ink, 0.005);
  const worker = makeFigure(COLORS.deep, true);
  worker.position.set(1.05, 0.5, 0.25);
  group.add(worker);
}

function buildDemolition(group: THREE.Group) {
  addBox(group, [3.6, 0.18, 2.8], [0, 0.34, 0], COLORS.oat, 0.05);
  for (let x = -1.35; x <= 1.35; x += 0.45) {
    for (let y = 0; y < 4; y += 1) {
      if (Math.abs(x) < 0.55 && y < 3) continue;
      addBox(group, [0.42, 0.32, 0.22], [x, 0.63 + y * 0.33, -0.65], COLORS.brick, 0.02);
    }
  }
  const excavator = new THREE.Group();
  addBox(excavator, [0.9, 0.42, 0.62], [0, 0.25, 0], COLORS.gold, 0.08);
  addBeam(excavator, [0.35, 0.45, 0], [0.88, 1.0, 0], COLORS.gold, 0.09);
  addBeam(excavator, [0.88, 1, 0], [1.18, 0.72, 0], COLORS.gold, 0.075);
  excavator.position.set(-0.8, 0.47, 0.55);
  group.add(excavator);
}

function buildWaterproof(group: THREE.Group) {
  addRoomShell(group, 0xcfc3b6);
  addBox(group, [3.12, 0.07, 2.45], [0.08, 0.48, 0.05], COLORS.blue, 0.025);
  addBox(group, [3.08, 0.74, 0.035], [0.08, 0.82, -1.2], COLORS.blue, 0.01);
  addBox(group, [0.035, 0.74, 2.42], [-1.5, 0.82, 0.05], COLORS.blue, 0.01);
  const worker = makeFigure(COLORS.orange, true);
  worker.position.set(0.65, 0.48, 0.3);
  group.add(worker);
}

function buildUtilities(group: THREE.Group) {
  addRoomShell(group, 0xd5c9bd);
  const pipeX = [-1.05, -0.35, 0.42, 1.08];
  pipeX.forEach((x, index) => {
    const vertical = cylinder(0.055, 1.25, index % 2 ? COLORS.blue : COLORS.orange, 12);
    vertical.position.set(x, 1.18, -1.16);
    group.add(vertical);
    addBeam(group, [x, 0.58, -1.15], [x * 0.68, 0.58, 0.65], index % 2 ? COLORS.blue : COLORS.orange, 0.055);
  });
  const worker = makeFigure(COLORS.deep, true);
  worker.position.set(0.1, 0.38, 0.35);
  group.add(worker);
}

function buildHvac(group: THREE.Group) {
  addBox(group, [3.7, 0.18, 2.8], [0, 0.34, 0], COLORS.oat, 0.05);
  addBox(group, [2.05, 0.62, 0.95], [0.3, 1.62, -0.2], COLORS.deep, 0.1);
  addBeam(group, [-1.45, 1.92, -0.7], [1.5, 1.92, -0.7], COLORS.red, 0.055);
  addBeam(group, [-1.1, 1.66, 0.35], [1.45, 1.66, 0.35], COLORS.gold, 0.07);
  const worker = makeFigure(COLORS.orange, true);
  worker.position.set(-0.85, 0.38, 0.45);
  group.add(worker);
}

function buildWoodwork(group: THREE.Group) {
  addBox(group, [3.7, 0.18, 2.8], [0, 0.34, 0], COLORS.oat, 0.05);
  [-1.2, 0, 1.2].forEach((x) => {
    addBeam(group, [x, 0.48, -1.0], [x, 2.05, -1.0], COLORS.plywood, 0.075);
    addBeam(group, [x, 0.48, 1.0], [x, 2.05, 1.0], COLORS.plywood, 0.075);
    addBeam(group, [x, 2.0, -1.0], [x, 2.0, 1.0], COLORS.plywood, 0.075);
  });
  addBeam(group, [-1.25, 2.0, -1.0], [1.25, 2.0, -1.0], COLORS.plywood, 0.075);
  const worker = makeFigure(COLORS.deep, true);
  worker.position.set(0.65, 0.38, 0.35);
  group.add(worker);
}

function buildCabinetry(group: THREE.Group) {
  addRoomShell(group);
  const widths = [0.72, 0.72, 0.92];
  let x = -0.95;
  widths.forEach((width, index) => {
    addBox(group, [width, 1.55 + index * 0.12, 0.62], [x, 1.18 + index * 0.06, -0.85], index === 1 ? COLORS.milk : COLORS.plywood, 0.055);
    addBox(group, [0.035, 0.16, 0.04], [x + width * 0.28, 1.25, -0.51], COLORS.deep, 0.01);
    x += width + 0.16;
  });
  const figure = makeFigure(COLORS.gold);
  figure.position.set(0.65, 0.38, 0.35);
  group.add(figure);
}

function buildPainting(group: THREE.Group) {
  addRoomShell(group, COLORS.paper);
  for (let index = 0; index < 7; index += 1) {
    const stripe = addBox(group, [0.22, 1.25, 0.03], [-1.1 + index * 0.36, 1.18, -1.2], index < 4 ? 0xc9b9aa : COLORS.oat, 0.01);
    stripe.rotation.z = index % 2 ? 0.02 : -0.02;
  }
  const worker = makeFigure(COLORS.orange, true);
  worker.position.set(0.7, 0.38, 0.25);
  group.add(worker);
  const roller = addBox(group, [0.62, 0.14, 0.14], [0.25, 1.35, -0.8], COLORS.orange, 0.06);
  roller.userData.motion = 'roller';
}

function buildLighting(group: THREE.Group) {
  addRoomShell(group);
  const cable = cylinder(0.025, 0.7, COLORS.deep, 8);
  cable.position.set(0, 2.1, -0.1);
  const lamp = sphere(0.32, 0xf1c778, { emissive: 0xc88c36, emissiveIntensity: 1.2 });
  lamp.position.set(0, 1.72, -0.1);
  lamp.userData.motion = 'light';
  group.add(cable, lamp);
  const worker = makeFigure(COLORS.deep, true);
  worker.position.set(0.65, 0.38, 0.35);
  group.add(worker);
  addBeam(group, [0.55, 0.48, 0.4], [0.25, 1.45, 0.15], COLORS.plywood, 0.055);
  addBeam(group, [0.95, 0.48, 0.4], [0.25, 1.45, 0.15], COLORS.plywood, 0.055);
}

function buildHandover(group: THREE.Group) {
  addRoomShell(group, COLORS.paper);
  const figure = makeFigure(COLORS.orange);
  figure.position.set(-0.55, 0.38, 0.4);
  group.add(figure);
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 1.8, 18, 1, true),
    material(0xffe6aa, { transparent: true, opacity: 0.22, side: THREE.DoubleSide }),
  );
  beam.rotation.z = -Math.PI / 2;
  beam.position.set(0.28, 1.18, -0.25);
  group.add(beam);
  addBox(group, [0.16, 0.2, 0.025], [0.75, 1.25, -1.2], COLORS.red, 0.03);
  addBox(group, [0.16, 0.2, 0.025], [1.1, 0.85, -1.2], COLORS.red, 0.03);
}

function makeWhale() {
  const whale = new THREE.Group();
  const body = sphere(0.45, COLORS.gold);
  body.scale.set(1.45, 0.72, 0.75);
  whale.add(body);
  const tailA = roundedBox(0.34, 0.12, 0.3, COLORS.gold, 0.08);
  const tailB = tailA.clone();
  tailA.position.set(-0.68, 0.08, -0.16);
  tailB.position.set(-0.68, 0.08, 0.16);
  tailA.rotation.y = -0.55;
  tailB.rotation.y = 0.55;
  whale.add(tailA, tailB);
  return whale;
}

function buildMoveIn(group: THREE.Group) {
  addBox(group, [3.8, 0.2, 3.0], [0, 0.34, 0], COLORS.oat, 0.05);
  addBox(group, [2.3, 1.45, 1.75], [0.15, 1.18, -0.2], COLORS.milk, 0.08);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.72, 0.82, 4), material(COLORS.ink));
  roof.position.set(0.15, 2.25, -0.2);
  roof.rotation.y = Math.PI / 4;
  group.add(roof);
  [-0.45, 0.55].forEach((x) => {
    const window = addBox(group, [0.48, 0.5, 0.04], [x, 1.32, 0.69], 0xf4c679, 0.04);
    const windowMaterial = window.material as THREE.MeshStandardMaterial;
    windowMaterial.emissive.set(0xc8852e);
    windowMaterial.emissiveIntensity = 1.2;
  });
  const colors = [COLORS.orange, COLORS.gold, COLORS.sage, COLORS.deep, COLORS.red];
  colors.forEach((color, index) => {
    const figure = makeFigure(color);
    figure.scale.setScalar(0.74);
    figure.position.set(-1.05 + index * 0.52, 0.42, 1.0 + (index % 2) * 0.16);
    group.add(figure);
  });
  const whale = makeWhale();
  whale.position.set(-1.1, 1.85, 0.45);
  whale.scale.setScalar(0.72);
  whale.userData.motion = 'whale';
  group.add(whale);
}

function buildSceneByKind(group: THREE.Group, kind: SceneKind) {
  const builders: Record<SceneKind, (target: THREE.Group) => void> = {
    inspection: buildInspection,
    needs: buildNeeds,
    drawing: buildDrawing,
    contract: buildContract,
    protection: buildProtection,
    demolition: buildDemolition,
    waterproof: buildWaterproof,
    utilities: buildUtilities,
    hvac: buildHvac,
    woodwork: buildWoodwork,
    cabinetry: buildCabinetry,
    painting: buildPainting,
    lighting: buildLighting,
    handover: buildHandover,
    movein: buildMoveIn,
  };
  builders[kind](group);
}

export async function createMapScene(canvas: HTMLCanvasElement): Promise<MapSceneController> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(COLORS.oat, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COLORS.oat, 13, 29);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);

  const ambient = new THREE.HemisphereLight(0xfff5e7, 0x8e7968, 2.45);
  const key = new THREE.DirectionalLight(0xffe2bd, 4.2);
  key.position.set(-7, 12, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  scene.add(ambient, key);

  const world = new THREE.Group();
  scene.add(world);

  const routePoints = mapCameraPoses.map((pose) => new THREE.Vector3(pose.x, 0.56, pose.z));
  const routeCurve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.18);
  const route = new THREE.Mesh(
    new THREE.TubeGeometry(routeCurve, 220, 0.2, 10, false),
    material(COLORS.orange, { roughness: 0.7 }),
  );
  route.receiveShadow = true;
  world.add(route);

  const cameraCurve = new THREE.CatmullRomCurve3(
    mapCameraPoses.map((pose) => new THREE.Vector3(pose.cameraX, pose.cameraY, pose.cameraZ)),
    false,
    'catmullrom',
    0.2,
  );
  const targetCurve = new THREE.CatmullRomCurve3(
    mapCameraPoses.map((pose) => new THREE.Vector3(pose.x * 0.85, 0.72, pose.z)),
    false,
    'catmullrom',
    0.2,
  );

  const phaseLoaders = {
    1: () => import('./phases/phase-01'),
    2: () => import('./phases/phase-02'),
    3: () => import('./phases/phase-03'),
    4: () => import('./phases/phase-04'),
  } as const;
  const phaseGroups = new Map<number, THREE.Group>();
  const stationGroups = new Map<string, THREE.Group>();
  const interactionTargets: THREE.Object3D[] = [];
  const pulseTimes = new Map<string, number>();
  let activeStation = 's01';
  let hoveredStation = '';
  let progress = 0;
  let running = true;
  let destroyed = false;
  let animationFrame = 0;
  const clock = new THREE.Clock();
  const cameraGoal = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const currentLook = new THREE.Vector3();
  const scaleGoal = new THREE.Vector3();

  const addPhaseTerrain = (phase: number, group: THREE.Group) => {
    const centerZ = [0, -7.6, -14.6, -21.7][phase - 1];
    const depth = phase === 4 ? 5.2 : 5.6;
    const colors = [COLORS.milk, 0xe2d5c6, 0xd7c4ae, 0xcbb395];
    const terrain = roundedBox(13.4, 0.34, depth, colors[phase - 1], 0.2);
    terrain.position.set(0, 0.06, centerZ);
    terrain.receiveShadow = true;
    group.add(terrain);
  };

  const buildStation = (descriptor: PhaseStationScene, phaseGroup: THREE.Group) => {
    const pose = mapCameraPoses.find((item) => item.id === descriptor.id);
    if (!pose) return;
    const station = new THREE.Group();
    station.position.set(pose.x, 0, pose.z);
    station.userData.stationId = descriptor.id;
    station.userData.locked = descriptor.locked;

    const platform = roundedBox(4.15, 0.42, 3.35, descriptor.locked ? 0xbda990 : COLORS.paper, 0.2);
    platform.position.y = 0.31;
    platform.userData.stationId = descriptor.id;
    interactionTargets.push(platform);
    station.add(platform);

    const plinth = cylinder(0.43, 0.16, descriptor.locked ? COLORS.ink : COLORS.orange, 24);
    plinth.position.set(-1.45, 0.68, 1.15);
    plinth.userData.stationId = descriptor.id;
    interactionTargets.push(plinth);
    station.add(plinth);

    const content = new THREE.Group();
    content.position.y = 0.25;
    buildSceneByKind(content, descriptor.kind);
    if (descriptor.locked) content.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const meshMaterial = object.material as THREE.MeshStandardMaterial;
      if (!meshMaterial?.color) return;
      meshMaterial.color.lerp(new THREE.Color(COLORS.milk), 0.26);
    });
    station.add(content);
    phaseGroup.add(station);
    stationGroups.set(descriptor.id, station);
  };

  const loadPhase = async (phase: 1 | 2 | 3 | 4) => {
    if (phaseGroups.has(phase) || destroyed) return;
    const module = await phaseLoaders[phase]();
    if (destroyed) return;
    const phaseGroup = new THREE.Group();
    phaseGroup.name = `phase-${phase}`;
    phaseGroup.scale.set(0.001, 0.001, 0.001);
    addPhaseTerrain(phase, phaseGroup);
    module.phaseStations.forEach((descriptor) => buildStation(descriptor, phaseGroup));
    world.add(phaseGroup);
    phaseGroups.set(phase, phaseGroup);
    const start = performance.now();
    const reveal = () => {
      const value = clamp((performance.now() - start) / 520);
      const eased = 1 - Math.pow(1 - value, 3);
      phaseGroup.scale.setScalar(Math.max(0.001, eased));
      if (value < 1 && !destroyed) requestAnimationFrame(reveal);
    };
    reveal();
    window.dispatchEvent(new CustomEvent('map:phase-loaded', { detail: { phase } }));
  };

  const setProgress = (nextProgress: number) => {
    progress = clamp(nextProgress);
    cameraCurve.getPointAt(progress, cameraGoal);
    targetCurve.getPointAt(progress, lookGoal);
  };

  const setActiveStation = (stationId: string) => {
    if (activeStation === stationId) return;
    activeStation = stationId;
    pulseTimes.set(stationId, performance.now());
  };

  const findStationId = (object: THREE.Object3D | null) => {
    let current = object;
    while (current) {
      if (typeof current.userData.stationId === 'string') return current.userData.stationId as string;
      current = current.parent;
    }
    return '';
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const updatePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactionTargets, false)[0];
    hoveredStation = findStationId(hit?.object ?? null);
    canvas.style.cursor = hoveredStation ? 'pointer' : '';
  };
  const handlePointerLeave = () => {
    hoveredStation = '';
    canvas.style.cursor = '';
  };
  const handleClick = () => {
    if (!hoveredStation) return;
    window.dispatchEvent(new CustomEvent('map:canvas-station', { detail: { stationId: hoveredStation } }));
  };
  canvas.addEventListener('pointermove', updatePointer);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('click', handleClick);

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('map:webgl-fallback', { detail: { reason: 'context-lost' } }));
  };
  canvas.addEventListener('webglcontextlost', handleContextLost);

  setProgress(0);
  camera.position.copy(cameraGoal);
  currentLook.copy(lookGoal);
  camera.lookAt(currentLook);

  const render = () => {
    if (destroyed) return;
    animationFrame = requestAnimationFrame(render);
    if (!running) return;
    const elapsed = clock.getElapsedTime();
    camera.position.lerp(cameraGoal, 0.085);
    currentLook.lerp(lookGoal, 0.1);
    camera.lookAt(currentLook);

    stationGroups.forEach((station, stationId) => {
      const pulseAge = performance.now() - (pulseTimes.get(stationId) ?? -5000);
      const pulse = pulseAge < 620 ? Math.sin((pulseAge / 620) * Math.PI) * 0.075 : 0;
      const hover = stationId === hoveredStation ? 0.055 : 0;
      scaleGoal.setScalar(1 + pulse + hover);
      station.scale.lerp(scaleGoal, 0.14);
      if (stationId !== activeStation && stationId !== hoveredStation) return;
      station.traverse((object) => {
        if (object.userData.motion === 'stamp') object.position.y = 1.28 + Math.abs(Math.sin(elapsed * 2.4)) * 0.045;
        if (object.userData.motion === 'roller') object.position.x = 0.25 + Math.sin(elapsed * 1.25) * 0.18;
        if (object.userData.motion === 'whale') object.position.y = 1.85 + Math.sin(elapsed * 1.5) * 0.06;
        if (object.userData.motion === 'reveal') object.scale.y = 0.75 + (Math.sin(elapsed * 1.1) * 0.5 + 0.5) * 0.08;
      });
    });

    renderer.render(scene, camera);
  };
  render();

  const pause = () => { running = false; };
  const resume = () => {
    running = true;
    clock.getDelta();
  };

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', updatePointer);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
      meshMaterials.forEach((item) => materials.add(item));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((item) => item.dispose());
    renderer.dispose();
  };

  await loadPhase(1);
  return { loadPhase, setProgress, setActiveStation, pause, resume, destroy };
}
