import code from "./walt/animation";

const label = "Bounce (canvas)";

function compile(buffer) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const setFillColor = (r, g, b, a) => {
    ctx.fillStyle = `rgba(${r},${g},${b},${a / 255.0})`;
  };
  const fillRect = (x, y, w, h) => {
    ctx.fillRect(x, y, w, h);
  };
  const getCanvasWidth = () => canvas.width;
  const getCanvasHeight = () => canvas.height;
  const env = {
    setFillColor,
    fillRect,
    getCanvasWidth,
    getCanvasHeight,
    log(val) {
      console.log(val);
    }
  };
  return WebAssembly.instantiate(buffer, { env }).then(result => {
    const exports = result.instance.exports;
    exports.onInit(30);

    let stopped = false;
    function step() {
      if (!stopped) {
        exports.onAnimationFrame(Date.now());
        window.requestAnimationFrame(step);
      }
    }
    window.requestAnimationFrame(step);

    return function() {
      stopped = true;
    };
  });
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
