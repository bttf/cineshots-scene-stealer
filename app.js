var url = require('url');
var http = require('http');
var fs = require('fs');

var options = {
  host: 'www.reddit.com',
  port: 80,
  path: '/r/CineShots/top/.json?sort=top&t=week',
  method: 'GET'
};

// fetch 3 pages of images
makeRequest(options, 3);

function makeRequest(options, pages, itemCnt) {
  var req = http.request(options, function(res) {
    var data = '';

    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      var obj = JSON.parse(data);
      var items = obj.data.children;
      var afterTag = obj.data.after;

      for (var i = 0; i < items.length; i++) {
        harvestImg(items[i]);
      }
      if (afterTag && pages > 0) {
        if (!itemCnt) itemCnt = 0;
        itemCnt += items.length;
        var options = {
          host: 'www.reddit.com',
          port: 80,
          path: '/r/CineShots/top/.json?sort=top&t=week&count=' + itemCnt + '&after=' + afterTag,
          method: 'GET'
        };
        makeRequest(options, --pages, itemCnt);
      }
    });
  });

  req.end();
}

function harvestImg(obj) {
  var tnUrl = url.parse(obj.data.url);
  var tnOptions = {
    host: tnUrl.host,
    port: 80,
    path: tnUrl.path,
    method: 'GET'
  };

  (function(filename) {
    var tnReq = http.request(tnOptions, function(res) {
      var imgData = '';
      res.setEncoding('binary');
      res.on('data', function(chunk) {
        imgData += chunk;
      });

      res.on('end', function() {
        fs.writeFile('.' + filename, imgData, 'binary', function(err) {
          if (err) console.log('error', err);
        });
      });
    });
    tnReq.end();
  })(tnUrl.path);
}
