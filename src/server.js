const http = require('http');
const url = require('url');
const query = require('querystring');
const responseHandler = require('./responses.js');
const htmlHandler = require('./htmlResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getStyle,
    '/getNote': responseHandler.getNote,
    notFound: responseHandler.notFound,
  },
  HEAD: {
    '/getNote': responseHandler.getNoteMeta,
    '/getUser': responseHandler.getUserMeta,
    notFound: responseHandler.notFoundMeta,
  },
  POST: {
    '/addNote': responseHandler.addNote,
    '/logIn': responseHandler.logIn,
  },
};

// handle a post request
const handlePost = (request, response, parsedUrl) => {
  if (urlStruct[request.method][parsedUrl.pathname]) {
    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);

      urlStruct[request.method][parsedUrl.pathname](request, response, bodyParams);
    });
  }
};

const handleRequest = (request, response, parsedUrl) => {
  console.dir(parsedUrl.pathname);
  console.dir(request.method);
  const params = query.parse(parsedUrl.query);

  if (urlStruct[request.method][parsedUrl.pathname]) {
    urlStruct[request.method][parsedUrl.pathname](request, response, params);
  } else {
    urlStruct[request.method].notFound(request, response, params);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleRequest(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port);

console.log(`listening on 127.0.0.1: ${port}`);
