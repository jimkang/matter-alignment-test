import accessor from 'accessor';

import { select } from 'd3-selection';
var boneRoot = select('#bone-root');
var diagnosticsRoot = select('#diagnostics-root');

export function renderBones({ bodies, svgPathsForSpecs, specs }) {
  //console.log(bodies.map((body) => body.vertices));
  renderBounds({ bodies });

  var bones = boneRoot
    .selectAll('.bone')
    .data(bodies.filter((body) => body.label in svgPathsForSpecs, accessor()));
  bones.exit().remove();
  var newBones = bones
    .enter()
    .append('g')
    .attr('class', (body) => 'bone ' + body.label);
  newBones.each(appendPaths);

  newBones
    .merge(bones)
    //.attr('transform-origin', getTransformOrigin)
    .attr('transform', getTransform);

  function getTransform(body) {
    const angleDegrees = (body.angle / (2 * Math.PI)) * 360;
    var spec = specs.find((bone) => bone.id === body.label);
    if (!spec) {
      throw new Error(`No spec for ${body.label}.`);
    }

    // bbox does not take transforms into account.
    var bbox = this.getBBox({ stroke: true });

    const widthDiff =
      spec.width -
      (spec.verticesWidth
        ? spec.verticesWidth
        : body.bounds.max.x - body.bounds.min.x);
    const heightDiff =
      spec.height -
      (spec.verticesHeight
        ? spec.verticesHeight
        : body.bounds.max.y - body.bounds.min.y);

    const translateToOriginString = `translate(${-bbox.width / 2}, ${
      -bbox.height / 2
    })`;
    const rotationString = `rotate(${angleDegrees})`;
    const translateString = `translate(${body.position.x}, ${body.position.y})`;
    // The last command in the transform string goes first. Translate to origin,
    // then rotate, then translate to the destination.
    return `${translateString} ${rotationString} ${translateToOriginString}`;
  }

  function appendPaths({ label }) {
    // cloneNode is necessary because appending it here will remove it from its
    // source tree.
    svgPathsForSpecs[label].forEach((path) =>
      this.appendChild(path.cloneNode())
    );
  }
}

function renderBounds({ bodies }) {
  var edges = bodies.map((body) => verticesToEdges(body.vertices)).flat();
  var lines = diagnosticsRoot.selectAll('line').data(edges);
  lines.exit().remove();
  lines
    .enter()
    .append('line')
    .attr('stroke', 'hsl(120, 50%, 50%)')
    .merge(lines)
    .attr('x1', (edge) => edge.x1)
    .attr('y1', (edge) => edge.y1)
    .attr('x2', (edge) => edge.x2)
    .attr('y2', (edge) => edge.y2);

  var dots = diagnosticsRoot.selectAll('circle').data(bodies);
  dots.exit().remove();
  dots
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('fill', 'hsl(150, 50%, 50%)')
    .merge(dots)
    .attr('cx', (body) => body.position.x)
    .attr('cy', (body) => body.position.y);
}

function verticesToEdges(vertices) {
  var edges = [];
  for (let i = 0; i < vertices.length - 1; ++i) {
    edges.push({
      x1: vertices[i].x,
      y1: vertices[i].y,
      x2: vertices[i + 1].x,
      y2: vertices[i + 1].y,
    });
  }
  return edges;
}
