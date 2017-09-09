'use strict'

const init = () => {
  const editor = window.ace.edit('editor')
  editor.setTheme('ace/theme/monokai')
  editor.getSession().setMode('ace/mode/javascript')

  const binary = window.ace.edit('binary')
  binary.setReadOnly(true)

  const compileButton = document.getElementById('compile')
  compileButton.addEventListener('click', () => {
    const src = editor.getValue()
    const wasm = window.Walt.getIR(src)
    binary.$blockScrolling = Infinity
    binary.setValue(wasm.debug(), -1)
    WebAssembly.instantiate(wasm.buffer()).then(result => {
      console.log('Module', result.module)
      console.log('Instance', result.instance)
      const exports = result.instance.exports
      console.log(
        'Exports',
        Object.keys(result.instance.exports).forEach(
          k =>
            typeof exports[k] === 'function'
              ? console.log(`${k} => ${exports[k]()}`)
              : console.log(`${k} => ${exports[k]}`),
        ),
      )
    })
  })
}

export default init
