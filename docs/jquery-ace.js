(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.jQueryAce = {
    initialize: function(element, options) {
      var klass;
      klass = (function() {
        switch (true) {
          case $(element).is('textarea'):
            return jQueryAce.TextareaEditor;
          default:
            return jQueryAce.BaseEditor;
        }
      })();
      return new klass(element, options);
    },
    defaults: {
      theme: null,
      lang: null,
      mode: null,
      width: null,
      height: null
    },
    version: '1.0.3',
    require: function() {
      switch (true) {
        case typeof ace.require === 'function':
          return ace.require.apply(null, arguments);
        case typeof window.require === 'function':
          return window.require.apply(null, arguments);
        default:
          throw "Can't find 'require' function";
      }
    }
  };

  jQueryAce.BaseEditor = (function() {

    function BaseEditor(element, options) {
      if (options == null) {
        options = {};
      }
      this.element = $(element);
      this.options = $.extend({}, jQueryAce.defaults, options);
    }

    BaseEditor.prototype.create = function() {
      this.editor = new jQueryAce.AceDecorator(ace.edit(this.element));
      return this.update();
    };

    BaseEditor.prototype.update = function(options) {
      var lang;
      if (options != null) {
        this.options = $.extend({}, this.options, options);
      }
      if (this.options.theme != null) {
        this.editor.theme(this.options.theme);
      }
      lang = this.options.lang || this.options.mode;
      if (lang != null) {
        return this.editor.lang(lang);
      }
    };

    BaseEditor.prototype.destroy = function() {
      this.element.data('ace', null);
      this.editor.destroy();
      return this.element.empty();
    };

    return BaseEditor;

  })();

  jQueryAce.TextareaEditor = (function(_super) {

    __extends(TextareaEditor, _super);

    function TextareaEditor() {
      return TextareaEditor.__super__.constructor.apply(this, arguments);
    }

    TextareaEditor.prototype.show = function() {
      var _ref;
      if ((_ref = this.container) != null) {
        _ref.show();
      }
      return this.element.hide();
    };

    TextareaEditor.prototype.hide = function() {
      var _ref;
      if ((_ref = this.container) != null) {
        _ref.hide();
      }
      return this.element.show();
    };

    TextareaEditor.prototype.create = function() {
      var _this = this;
      this.container = this.createAceContainer();
      this.editor = new jQueryAce.AceDecorator(ace.edit(this.container.get(0)));
      this.update();
      this.editor.value(this.element.val());
      this.editor.ace.on('change', function(e) {
        return _this.element.val(_this.editor.value());
      });
      return this.show();
    };

    TextareaEditor.prototype.destroy = function() {
      TextareaEditor.__super__.destroy.call(this);
      this.hide();
      return this.container.remove();
    };

    TextareaEditor.prototype.createAceContainer = function() {
      return this.buildAceContainer().insertAfter(this.element);
    };

    TextareaEditor.prototype.buildAceContainer = function() {
      return $('<div></div>').css({
        display: 'none',
        position: 'relative',
        width: this.options.width || this.element.width(),
        height: this.options.height || this.element.height()
      });
    };

    return TextareaEditor;

  })(jQueryAce.BaseEditor);

  jQueryAce.AceDecorator = (function() {

    function AceDecorator(ace) {
      this.ace = ace;
    }

    AceDecorator.prototype.theme = function(themeName) {
      return this.ace.setTheme("ace/theme/" + themeName);
    };

    AceDecorator.prototype.lang = function(modeName) {
      var klass;
      klass = jQueryAce.require("ace/mode/" + modeName).Mode;
      return this.session().setMode(new klass);
    };

    AceDecorator.prototype.mode = function(modeName) {
      return this.lang(modeName);
    };

    AceDecorator.prototype.session = function() {
      return this.ace.getSession();
    };

    AceDecorator.prototype.destroy = function() {
      return this.ace.destroy();
    };

    AceDecorator.prototype.value = function(text) {
      if (text != null) {
        return this.ace.insert(text);
      } else {
        return this.ace.getValue();
      }
    };

    return AceDecorator;

  })();

  (function($) {
    $.ace = function(element, options) {
      return $(element).ace(options);
    };
    return $.fn.ace = function(options) {
      return this.each(function() {
        var editor;
        editor = $(this).data('ace');
        if (editor != null) {
          return editor.update(options);
        } else {
          editor = jQueryAce.initialize(this, options);
          editor.create();
          return $(this).data('ace', editor);
        }
      });
    };
  })(jQuery);

}).call(this);
