import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { renderBones } from './renderers/render-bones';
import { UpdatePositions } from './updaters/update-positions';
import { getPathsFromSVG } from './util/get-paths-from-svg';
import testSpec from './test-spec.json';

var routeState;

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
  });
  routeState.routeFromHash();
})();

async function followRoute() {
  var board = document.getElementById('bone-canvas');
  const boardWidth = +board.getAttribute('width');
  const boardHeight = +board.getAttribute('height');

  var svgPathsForSpecs = {
    [testSpec.id]: await getSVGPathsFromURL('static/test.svg'),
  };

  var updatePositions = UpdatePositions({
    boardWidth,
    boardHeight,
    renderableSpecs: [testSpec],
  });

  loop();

  function loop() {
    var bodies = updatePositions();
    renderBones({
      bodies,
      svgPathsForSpecs,
      specs: [testSpec],
    });
    requestAnimationFrame(loop);
  }
}

async function getSVGPathsFromURL(url) {
  try {
    let res = await fetch(url);
    let text = await res.text();
    let parser = new window.DOMParser();
    let root = parser.parseFromString(text, 'image/svg+xml');
    return getPathsFromSVG({
      svgNode: root,
      discardTransforms: false,
      normalize: false,
    });
  } catch (error) {
    console.error(`Could not get SVG root for ${url}.`, error);
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
