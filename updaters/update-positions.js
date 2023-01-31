import { Engine, Bodies, Body, Composite } from 'matter-js';

export function UpdatePositions({
  fps = 60,
  boardWidth,
  boardHeight,
  groundThickness = 60,
  renderableSpecs,
}) {
  var engine = new Engine.create();
  // create two walls and a ground
  var wallA = Bodies.rectangle(40, boardHeight / 2, 10, boardHeight, {
    isStatic: true,
  });
  var wallB = Bodies.rectangle(
    boardWidth - 40,
    boardHeight / 2,
    10,
    boardHeight,
    { isStatic: true }
  );
  var ground = Bodies.rectangle(
    boardWidth / 2,
    boardHeight - groundThickness,
    boardWidth,
    groundThickness,
    { isStatic: true }
  );

  // add all of the bodies to the world
  Composite.add(engine.world, [wallA, wallB, ground]);

  // Make boxes for the specs.
  var specBoxes = renderableSpecs.map(boxForSpec);
  Composite.add(engine.world, specBoxes);

  return updatePositions;

  function updatePositions() {
    Engine.update(engine, 1000 / fps);
    return Composite.allBodies(engine.world);
  }

  function boxForSpec(spec) {
    const x = boardWidth / 2;
    const y = boardHeight / 4;

    var bodyOpts = {
      angle: spec.rotationAngle,
      label: spec.id,
      restitution: 0.8,
    };

    if (spec.vertices) {
      return Body.create(
        Object.assign(
          {
            vertices: spec.vertices.map((pt) => ({ x: pt[0], y: pt[1] })),
            position: { x, y },
          },
          bodyOpts
        )
      );
    }
    throw new Error('Missing vertices.');
  }
}
