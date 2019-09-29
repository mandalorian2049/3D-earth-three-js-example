import { select } from 'd3-selection';
import { geoEquirectangular, geoPath } from 'd3-geo';

const projection = geoEquirectangular()
  .translate([1024, 512])
  .scale(325);

export const mapTexture = (geojson) => {

  const canvas = select('body').append('canvas')
    // .style('display', 'none')
    .attr('width', '2048px')
    .attr('height', '1024px');

  const context = canvas.node().getContext('2d');
  context.beginPath();
  context.rect(-1, -1, canvas.node().width + 1, canvas.node().height + 1);
  context.fillStyle = '#F5F5F5';
  context.fill();

  const path = geoPath()
    .projection(projection)
    .context(context);

  // console.log(path);

  context.strokeStyle = '#ffffff';
  context.lineWidth = 1;
  context.fillStyle = '#CCC';

  context.beginPath();

  path(geojson);
  context.fill();

  context.stroke();

  // DEBUGGING - Really expensive, disable when done.
  // console.log(canvas.node().toDataURL());
  return canvas;
  // const texture = new THREE.Texture(canvas.node());
  // texture.needsUpdate = true;

  // canvas.remove();

  // return texture;
};
