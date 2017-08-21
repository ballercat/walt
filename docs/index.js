(function() {
  const editor = window.ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setMode('ace/mode/javascript');

  const binary = window.ace.edit('binary');
})();
