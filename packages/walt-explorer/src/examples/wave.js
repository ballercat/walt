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

  const brushMatrix = [];
  const brushMatrixRadius = 28;
  for (let p = -brushMatrixRadius; p <= brushMatrixRadius; p++) {
    const row = [];
    brushMatrix.push(row);
    for (let q = -brushMatrixRadius; q <= brushMatrixRadius; q++) {
      const element = Math.floor(0x3FFFFFFF * Math.exp(-0.05 * ((p * p) + (q * q))));
      row.push(element);
    }
  }

  return WebAssembly.instantiate(buffer, { env }).then(result => {

    const exports = result.instance.exports;
    const memory = exports.memory;

    const { width, height } = canvas;
    const wh = width * height;
    const pages = 1 + ((20 * wh) >> 16);
    memory.grow(pages);
    const heap = memory.buffer;
    const HEAP_START = 65536;

    const imageArray = new Uint8ClampedArray(heap, HEAP_START, 4 * wh);
    const forceArray = new Int32Array(heap, HEAP_START + 4 * wh, wh);

    let lastMouseX = null;
    let lastMouseY = null;

    function applyBrush(x, y) {
      const applyCap = (x) => (x < -0x40000000 ? -0x40000000 : (x > 0x3FFFFFFF ? 0x3FFFFFFF : x));
      const { width, height } = canvas;
      for (let p = -brushMatrixRadius; p <= brushMatrixRadius; p++) {
        const targetY = y + p;
        if (targetY <= 0 || targetY >= height - 1) {
          continue;
        }
        for (let q = -brushMatrixRadius; q <= brushMatrixRadius; q++) {
          const targetX = x + q;
          if (targetX <= 0 || targetX >= width - 1) {
            continue;
          }
          const brushValue = brushMatrix[p + brushMatrixRadius][q + brushMatrixRadius];
          const targetIndex = targetY * width + targetX;
          forceArray[targetIndex] += brushValue;
          forceArray[targetIndex] = applyCap(forceArray[targetIndex]);
        }
      }
    }

    canvas.onmousedown = (e) => {
      e.preventDefault();
      let bbox = canvas.getBoundingClientRect();
      const mouseX = Math.round(e.clientX - bbox.left * (width / bbox.width));
      const mouseY = Math.round(e.clientY - bbox.top * (height / bbox.height));
      lastMouseX = mouseX;
      lastMouseY = mouseY;
      applyBrush(mouseX, mouseY);
    };

    canvas.onmousemove = (e) => {
      e.preventDefault();
      let bbox = canvas.getBoundingClientRect();
      const mouseX = Math.round(e.clientX - bbox.left * (width / bbox.width));
      const mouseY = Math.round(e.clientY - bbox.top * (height / bbox.height));
      if (lastMouseX !== null && lastMouseY !== null) {
        const r = Math.sqrt((mouseX - lastMouseX) * (mouseX - lastMouseX) + (mouseY - lastMouseY) * (mouseY - lastMouseY));
        for (let t = 0; t <= r; t += 5) {
          const currX = Math.round(lastMouseX + ((mouseX - lastMouseX) * (t / r)));
          const currY = Math.round(lastMouseY + ((mouseY - lastMouseY) * (t / r)));
          applyBrush(currX, currY);
          forceArray[currY * width + currX] = 0x3FFFFFFF;
        }
        applyBrush(mouseX);
        applyBrush(mouseY);
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };

    canvas.onmouseout = canvas.onmouseup = (e) => {
      e.preventDefault();
      lastMouseX = null;
      lastMouseY = null;
    };

    const stepJS = () => {

      const statusArray = new Int32Array(heap, HEAP_START + 8 * wh, wh);
      const uArray = new Int32Array(heap, HEAP_START + 12 * wh, wh);
      const velArray = new Int32Array(heap, HEAP_START + 16 * wh, wh);

      const image32Array = new Uint32Array(heap, HEAP_START, wh);

      const applyCap = (x) => (x < -0x40000000 ? -0x40000000 : (x > 0x3FFFFFFF ? 0x3FFFFFFF : x));

      const toRGB = (x) => {
        const val = x >> 22;
        if (val < 0) {
          return ((-(val + 1)) | 0xFF000000); // red
        }
        return (((val << 8) | (val << 16)) | 0xFF000000); // cyan
      };

      // Draw walls
      for (let i = 0; i < height; i++) {
        statusArray[i * width] = 1;
        statusArray[i * width + width - 1] = 1;
      }
      for (let i = 0; i < width; i++) {
        statusArray[i] = 1;
        statusArray[width * height - width + i] = 1;
      }

      for (let i = 0; i < wh; i += 1) {
        if (statusArray[i] === 0) {
          const uCen = uArray[i];
          const uNorth = uArray[i - width];
          const uSouth = uArray[i + width];
          const uEast = uArray[i + 1];
          const uWest = uArray[i - 1];
          const uxx = (((uWest + uEast) >> 1) - uCen);
          const uyy = (((uNorth + uSouth) >> 1) - uCen);
          velArray[i] = applyCap(velArray[i] + (uxx >> 1) + (uyy >> 1));
        }
      }
      for (let i = 0; i < wh; i += 1) {
        if (statusArray[i] === 0) {
          const f = forceArray[i];
          uArray[i] = applyCap(f + applyCap(uArray[i] + velArray[i]));
          forceArray[i] = f >> 1;
        }
      }

      for (let i = 0; i < wh; i += 1) {
        if (statusArray[i] === 1) {
          image32Array[i] = 0xFFFF0000;
        } else {
          image32Array[i] = toRGB(uArray[i]);
        }
      }
    };

    let stopped = false;
    let useJS = false;

    document.body.addEventListener('keydown', () => {
      useJS = true;
    });

    document.body.addEventListener('keyup', () => {
      useJS = false;
    });

    function step() {
      if (!stopped) {
        if (useJS) {
          console.time('JS');
          stepJS();
          console.timeEnd('JS');
        } else {
          console.time('WALT');
          exports.step();
          console.timeEnd('WALT');
        }
        imgData.data.set(imageArray);
        ctx.putImageData(imgData, 0, 0);
        setTimeout(step, 0);
      }
    }
    step();
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
