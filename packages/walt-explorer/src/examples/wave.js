import code from './walt/wave';

const label = "Wave (canvas)";
const output = "Canvas";

function compile(buffer) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const imgData = ctx.createImageData(canvas.width, canvas.height);

  const getCanvasWidth = () => canvas.width;
  const getCanvasHeight = () => canvas.height;
  const env = {
    getCanvasWidth,
    getCanvasHeight,
    log: (val) => {
      console.log(val);
    }
  };
  return WebAssembly.instantiate(buffer, { env }).then(result => {

    const exports = result.instance.exports;
    const memory = exports.memory;

    const wh = canvas.width * canvas.height;
    const pages = 1 + ((20 * wh) >> 16);
    memory.grow(pages);
    const heap = memory.buffer;

    const imageArray = new UInt8ClampedArray(heap, HEAP_START, 4 * wh);
    const forceArray = new Int32Array(heap, HEAP_START + 8 * wh, wh);
    const statusArray = new Int32Array(heap, HEAP_START + 4 * wh, wh);

    let lastMouseX = null;
    let lastMouseY = null;

    canvas.onmousedown = (e) => {
      e.preventDefault();
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      forceArray[lastMouseY * canvas.width + lastMouseX] = 0x3FFFFFFF;
    };

    canvas.omousemove = (e) => {
      e.preventDefault();
      if (lastMouseX !== null && lastMouseY !== null) {
        const r = Math.sqrt((e.clientX - lastMouseX) * (e.clientX - lastMouseX) + (e.clientY - lastMouseY) * (e.clientY - lastMouseY));
        for (let t = 0; t <= r; t++) {
          const currX = Math.round(lastMouseX + ((e.clientX - lastMouseX) * (t / r)));
          const currY = Math.round(lastMouseY + ((e.clientY - lastMouseY) * (t / r)));
          forceArray[currY * canvas.width + currX] = 0x3FFFFFFF;
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    canvas.onmouseover = canvas.onmouseout = canvas.onmouseup = (e) => {
      e.preventDefault();
      lastMouseX = 0;
      lastMouseY = 0;
    };

    let stopped = false;

    function step() {
      if (!stopped) {
        exports.step();
        imgData.data.set(imageArray);
        context.putImageData(imgData, 0, 0);
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);
    return function() {
      stopped = true;
    }
  });
}

const example = {
  code,
  label,
  output,
  compile,
  js: compile.toString()
};

export default example;
