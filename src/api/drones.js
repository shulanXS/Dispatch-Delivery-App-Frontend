import apiClient from './client';

// GET /drones  -> Drone[]
// Drone shape: { id, droneCode, stationId, batteryLevel, position (WKT),
//               altitude, speed, status }
export async function getDrones() {
  const { data } = await apiClient.get('/drones');
  return data;
}

// GET /drones/{id}
export async function getDrone(id) {
  const { data } = await apiClient.get(`/drones/${id}`);
  return data;
}