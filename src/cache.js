const { resolve } = require('path');
const { createGzip } = require('zlib');
const { createReadStream, stat } = require('fs');

//实现缓存并对静态资源进行gzip压缩
function cache(req, res, filePath) {
  let originalHeaders = req.headers;
  let headers = {};
  // let filePath = resolve(__dirname, `./${file}`);
  //把请求头的key全部变为小写
  for (const key in originalHeaders) {
    headers[key.toLowerCase()] = originalHeaders[key];
  }
  stat(filePath, (err, stats) => {
    if (err) {
      res.write(err.message);
      res.end();
    } else {
      let mtime = stats.mtime.toUTCString();
      let reqMtime = headers['if-modified-since'];
      res.setHeader('last-modified', mtime);
      res.setHeader('Content-Encoding', 'gzip');
      if (reqMtime) {
        //第一次请示资源时，是没有if-modified-since此请求头
        if (new Date(mtime).getTime() - new Date(reqMtime) > 0) {
          createReadStream(filePath)
            .pipe(createGzip())
            .pipe(res);
        } else {
          res.statusCode = 304;
          res.write('');
          res.end();
        }
      } else {
        createReadStream(filePath)
          .pipe(createGzip())
          .pipe(res);
      }
    }
  });
}

module.exports = cache;
