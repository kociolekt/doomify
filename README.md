# doomify

> Auto-variablizing browserify plugin to require [Mustache](https://github.com/janl/mustache.js) template files.

## installation
Install from npm:
```
$ npm install doomify
```

## usage
Use it as browserify transform module with -t:
```
$ browserify -t doomify main.js -o bundle.js
```

Or use it as browserify transform module in gulp:
```js
browserify({
  entries: 'main.js',
  debug: true,
  transform: [
    'doomify'
  ]
});
```

Mustache template files (.dmt, .tpl, .html)
```html
<!-- template.html -->
<div class="example">
  {{content}}
  <div class="button" data-doomify="exampleButton"></div>
</div>
```

Require inside main.js and invoke like Mustache template. Use it like DOM Element with cached nodes in object fields.
```js
// main.js
var template = require('../../templates/template.html'); // Mustache template

// Append template with javascript
var templateDOM = template({content: 'Hello'}); // HTML DOM DocumentFragment
document.body.appendChild(templateDOM);

// Bind events
var templateButton = templateDOM.exampleButton // Cached HTML DOM Element Object
templateButton.addEventListener('click', function(){
  alert(1);
});
```
