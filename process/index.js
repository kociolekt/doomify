var
  Mustache = require('mustache'),
  autoElemsFromDom = require('auto-elems-from-dom');

require('auto-elems-from-dom/polyfill');

function process(source) {
  return function(data, partials) {
    var
      template = Mustache.render(source, data, partials),
      fragment = autoElemsFromDom(template, 'attr', 'data-doomify', true);
    return fragment;
  };
}

module.exports = process;
