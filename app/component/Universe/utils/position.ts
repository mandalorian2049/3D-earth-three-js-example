export const positionOnSphereFromLatLon = (lat, lon, radius) => {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lon * (Math.PI / 180);
  return {
    x: Math.cos(latRad) * Math.cos(lonRad) * radius,
    y: Math.sin(latRad) * radius,
    z: Math.cos(latRad) * Math.sin(lonRad) * radius,
  };
};
