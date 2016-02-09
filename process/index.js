var
  Mustache = require('mustache'),
  objectAssign = require('object-assign');

// ie 9, ie 10
if (
  (typeof Range !== 'undefined') &&
  !Range.prototype.createContextualFragment
) {
  Range.prototype.createContextualFragment = function(html) {
    var
      frag = document.createDocumentFragment(),
      div = document.createElement('div');
    frag.appendChild(div);
    div.outerHTML = html;
    return frag;
  };
}

// without additional div
function getDocumentFragmentFromString(html) {
  // return document.createRange().createContextualFragment(html); // FU safari
  var range = document.createRange();
  range.selectNode(document.body); // safari
  return range.createContextualFragment(html);
}

function getElementsFromDom(dom, type, name) {
  var
    pairs = {},
    elements;

  if (!name) throw new Error('no-name not allowed');

  if (typeof dom === 'string') {
    dom = getDocumentFragmentFromString(dom);
  }

  // check also for getDocumentFragmentFromString
  if (!dom.nodeType) {
    throw new Error('string or DOM node');
  }

  if (type === 'data') name = 'data-' + name;

  if (type === 'data' || type === 'attr') {
    elements = dom.querySelectorAll('[' + name + ']');
  } else if (type === 'class') {
    elements = dom.querySelectorAll('[class*="' + name + '-"]');
  } else {
    throw new Error('type "' + type + '" unsupported');
  }

  for(var i = 0, eLen = elements.length; i < eLen; i++) {
    var
      element = elements[i],
      key;

    if (type === 'data' || type === 'attr') {
      key = element.getAttribute(name);
    } else {
      key = element.className.match(new RegExp(name + '-' + '((-?\\w+)+)'));
      if (key && key.length) key = key[1];
    }

    if (!key) continue;
    if (!pairs[key]) pairs[key] = [];
    if (pairs[key]) pairs[key].push(element);
  }

  return objectAssign(dom.children, pairs);
}

function process(source) {
  return function(data, partials) {
    var
      template = Mustache.render(source, data, partials),
      fragment = getElementsFromDom(template, 'attr', 'data-doomify');
    return fragment;
  };
}

module.exports = process;
