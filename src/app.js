const { parse } = require('url');
const { resolve } = require('path');
const { createServer } = require('http');
const events = require('events');
const cache = require('./cache');
const { extname } = require('path');

const port = 8080;
const EventEmitter = events.EventEmitter;
const router = new EventEmitter();

createServer((req, res) => {
  const { pathname, query } = parse(req.url, true);
  const extName = extname(pathname);
  if (router.emit(pathname, req, res, query)) {
    //处理接口
  } else {
    //处理静态文件
    let filePath = resolve(__dirname + pathname);
    switch (extName) {
      case '.css':
        res.setHeader('content-type', 'text/css');
        cache(req, res, filePath);
        break;
      case '.png':
        res.setHeader('content-type', 'image/png');
        cache(req, res, filePath);
        break;
      case '.ico':
        res.setHeader('content-type', 'image/x-icon');
        cache(req, res, resolve(__dirname, `static${pathname}`));
        break;
      default:
        if (pathname === '/') {
          res.setHeader('content-type', 'text/html;charset=utf8');
          cache(req, res, resolve(__dirname, 'index.html'));
        } else {
          res.statusCode = 404;
          res.write('Not Found');
          res.end();
        }
        break;
    }
  }
}).listen(port);
