export type MapCameraPose = {
  id: string;
  x: number;
  z: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
};

const stationPositions = [
  [-5.4, 0], [-1.8, -0.6], [1.9, -0.2], [5.5, -1.1],
  [5.2, -7.1], [1.7, -7.7], [-2.1, -7.1], [-5.5, -8.1],
  [-5.2, -14.2], [-1.7, -14.8], [2.1, -14.2], [5.5, -15.2],
  [5.0, -21.3], [0, -22.1], [-5.1, -21.4],
] as const;

export const mapCameraPoses: MapCameraPose[] = stationPositions.map(([x, z], index) => ({
  id: `s${String(index + 1).padStart(2, '0')}`,
  x,
  z,
  cameraX: x * 0.58,
  cameraY: 6.6,
  cameraZ: z + 7.6,
}));

