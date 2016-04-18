var
  $ = require('jquery'),
  template = require('./mustache/index.html');

$(document).ready(function() {
  var t = template({
    item: 'world',
    posts: [
      {
        title: 'aaaaaaaaaaaa',
        body: 'lorem ipsum dolor sit amet'
      },
      {
        title: 'bbbbbbbbbbbb',
        body: 'ipsum dolor sit amet'
      },
      {
        title: 'bvvvvvvvvvvvv',
        body: 'dolor sit amet'
      }
    ]
  });
  console.log(t, t.button);
  $(document.body).find('#content').append(t);
});
