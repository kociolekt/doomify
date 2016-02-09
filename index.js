'use strict';

// ie 9, ie 10
// todo ponyfill??
if ((typeof Range !== 'undefined') && !Range.prototype.createContextualFragment) {
  Range.prototype.createContextualFragment = function(html) {
    var frag = document.createDocumentFragment();
    var div = document.createElement('div');
    frag.appendChild(div);
    div.outerHTML = html;
    return frag;
  };
}

// ===========================================

// let arrFromNodeList = Function.prototype.call.bind(Array.prototype.slice); // Array.from

// without additional div
function getDocumentFragmentFromString(html) {
  // return document.createRange().createContextualFragment(html); // FU safari
  let range = document.createRange();
  range.selectNode(document.body);// safari
  return range.createContextualFragment(html);
}

function getElementsFromDom(dom, type, name) {

  let elems;

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
    // todo selector, po co podwójny
    elems = dom.querySelectorAll('[class^="' + name + '-"], [class*=" ' + name + '-"]');
  } else {
    throw new Error('type "' + type + '" unsupported');
  }

  Array.from(elems).forEach(e => {

    let letName;
    
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

// ===========================================

var a = getElementsFromDom('<div data-elo="s1" class="elo-s1"><div data-elo="s2" class="dssd elo-s2 assdsd">111</div></div><div data-elo="s1" class="ss elo-s1">111</div>', 'attr', 'data-elo');
console.log(a, a.noi);

var b = getElementsFromDom('<div data-elo="s1" class="elo-s1"><div data-elo="s2" class="dssd elo-s2 assdsd">111</div></div><div data-elo="s1" class="ss elo-s1">111</div>', 'data', 'elo');
console.log(b, b.noi);

var c = getElementsFromDom('<div data-elo="s1" class="elo-s1"><div data-elo="s2" class="dssd elo-s2 assdsd">111</div></div><div data-elo="s1" class="ss elo-s1">111</div>', 'class', 'elo');
console.log(c, c.noi);
