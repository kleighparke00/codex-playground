const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT) || 4173;
const publicDirectory = __dirname;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

const server = http.createServer((request, response) => {
  const requestPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const filePath = path.resolve(publicDirectory, `.${decodeURIComponent(requestPath)}`);

  if (!filePath.startsWith(`${publicDirectory}${path.sep}`)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Unable to load the app');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(contents);
  });
});

server.listen(port, host, () => {
  console.log(`Sip Circle is ready at http://${host}:${port}`);
});
