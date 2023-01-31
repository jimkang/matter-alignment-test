import parsePath from 'svg-path-parser';

export function getPathsFromSVG({ svgNode, discardTransforms, normalize }) {
  var paths = Array.from(svgNode.querySelectorAll('path'));
  if (discardTransforms) {
    paths.forEach((path) => path.removeAttribute('transform'));
  }
  if (normalize) {
    paths = normalizePaths(paths);
  }
  return paths;
}

function normalizePaths(paths) {
  var minX = 999999999;
  var minY = 999999999;
  var commandGroups = paths.map((path) => parsePath(path.getAttribute('d')));
  for (let i = 0; i < commandGroups.length; ++i) {
    let cmds = commandGroups[i];
    for (let j = 0; j < cmds.length; ++j) {
      let cmd = cmds[j];
      if (cmd.x < minX) {
        minX = cmd.x;
      }
      if (cmd.y < minY) {
        minY = cmd.y;
      }
    }
  }
  commandGroups.forEach((group) =>
    group.forEach((command) => {
      command.x -= minX;
      command.y -= minY;
    })
  );
  for (let i = 0; i < paths.length; ++i) {
    let normCmds = commandGroups[i];
    paths[i].setAttribute('d', normCmds.map(stringifyCmd).join(' '));
  }
  return paths;
}

function stringifyCmd({ code, x, y }) {
  if (isNaN(x) || isNaN(y)) {
    return code;
  }
  return `${code}${x.toFixed(2)},${y.toFixed(2)}`;
}
