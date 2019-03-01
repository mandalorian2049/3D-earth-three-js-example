import { select } from 'd3-selection';
import { geoEquirectangular, geoPath } from 'd3-geo';

const projection = geoEquirectangular()
  .translate([1024, 512])
  .scale(325);

export const mapTexture = (geojson, color) => {

  const canvas = select('body').append('canvas')
    // .style('display', 'none')
    .attr('width', '2048px')
    .attr('height', '1024px');

  const context = canvas.node().getContext('2d');
  // context.fillStyle = 'blue';
  // context.fillRect(0, 0, canvas.width, canvas.height);

  const path = geoPath()
    .projection(projection)
    .context(context);

  // console.log(path);

  context.strokeStyle = '#333';
  context.lineWidth = 1;
  context.fillStyle = color || '#CDB380';

  context.beginPath();

  path(geojson);

  if (color) {
    context.fill();
  }

  context.stroke();

  // DEBUGGING - Really expensive, disable when done.
  // console.log(canvas.node().toDataURL());
  return canvas;
  // const texture = new THREE.Texture(canvas.node());
  // texture.needsUpdate = true;

  // canvas.remove();

  // return texture;
};
