var jstify = require('jstify');

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

  var elems;

  if (!name) throw new Error('no-name not allowed');

  if (typeof dom === 'string') {
    dom = getDocumentFragmentFromString(dom);
  }

  // check also for getDocumentFragmentFromString
  if (!dom.nodeType) {
    throw new Error('string or DOM node');
  }

  // nodes of interest :)
  dom.noi = {};

  if (type === 'data') name = 'data-' + name;

  if (type === 'data' || type === 'attr') {
    elems = dom.querySelectorAll('[' + name + ']');
  } else if (type === 'class') {
    elems = dom.querySelectorAll('[class*="' + name + '-"]');
  } else {
    throw new Error('type "' + type + '" unsupported');
  }

  Array.from(elems).forEach(function(e){

    var letName;

    if (type === 'data' || type === 'attr') {
      letName = e.getAttribute(name);
    } else {
      letName = e.className.match(new RegExp(name + '-' + '((-?\\w+)+)'));
      if (letName && letName.length) letName = letName[1];
    }

    if (!letName) return;
    if (!dom.noi[letName]) dom.noi[letName] = [];
    if (dom.noi[letName]) dom.noi[letName].push(e);

  });

  return dom;
}

function compile(str, minifierOpts, templateOpts) {
  return getElementsFromDom(
    jstify.compile(str, minifierOpts, templateOpts),
    'attr',
    'data-doomify');
}

module.exports = jstify;
module.exports.compile = compile;
module.exports.wrap = jstify.wrap;
module.exports.transform = jstify.transform;
