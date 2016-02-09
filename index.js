var minify = require('html-minifier').minify;
var Mustache = require('mustache');
var stream = require('stream');
var util = require('util');
var objectAssign = require('object-assign');

var MINIFIER_DEFAULTS = {
  // http://perfectionkills.com/experimenting-with-html-minifier/#options
  removeComments: true,
  collapseWhitespace: true,
  conservativeCollapse: true
};

var DEFAULTS = {
  templateOpts: {},
  minifierOpts: {},
  noMinify: false
};

function compile(str, minifierOpts) {
  var minified = minifierOpts === false ? str : minify(str, minifierOpts);
  return minified;
}

function wrap(source) {
  return 'var doomify = require(\'doomify\');\n' +
    'module.exports = doomify.template(\'' + source + '\');';
}

function transform(src, opts) {
  var compiled = compile(src, opts.noMinify ? false : opts.minifierOpts);
  var body = wrap(compiled);
  return body;
}

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

var templateExtension = /\.(dmt|tpl|html)$/;

function Doomify(opts) {
  stream.Transform.call(this);

  opts = objectAssign({}, opts, DEFAULTS);

  if (opts.minifierOpts !== false) {
    opts.minifierOpts = objectAssign({}, opts.minifierOpts, MINIFIER_DEFAULTS);
  }

  this._data = '';
  this._opts = opts;
}

util.inherits(Doomify, stream.Transform);

Doomify.prototype._transform = function (buf, enc, next) {
  this._data += buf;
  next();
};

Doomify.prototype._flush = function (next) {
  try {
    this.push(transform(this._data, this._opts));
  } catch(err) {
    this.emit('error', err);
    return;
  }
  next();
};

function doomify(file, opts) {
  if (!templateExtension.test(file)) {
    return new stream.PassThrough();
  }
  return new Doomify(opts);
}

function template(source) {
  var cachedTemplate = Mustache.parse(source);
  return function(data, partials) {
    return getElementsFromDom(
      Mustache.render(cachedTemplate, data, partials),
      'attr',
      'data-doomify');
  };
}

module.exports = doomify;
module.exports.compile = compile;
module.exports.wrap = wrap;
module.exports.transform = transform;
module.exports.template = template;
