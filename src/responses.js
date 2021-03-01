const notes = {};

// json response function, used to send a response as JSON
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// same as respondJSON but for head requests
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(status, headers);
  response.end();
};

// POST request to add note
const addNote = (request, response, body) => {
//start by assuming invalid parameters
  const responseJSON = {
    message: 'Title and content are required.',
  };
    
//check for parameters, if missing return 400 bad request
  if (!body.title || !body.content) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
    
//assume user is creating a new note
  let responseCode = 201;
    
//check for an existing title, if title exists send back 204 and update
  if (notes[body.title]) {
    responseCode = 204;
  } else {
    notes[body.title] = {};
    notes[body.title].title = body.title;
  }

//update content
  notes[body.title].content = body.content;

//send back 201
  if (responseCode === 201) {
    responseJSON.message = 'Created successfully.';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

// GET request for retrieving notes
const getNote = (request, response, params) => {
  const responseJSON = {
    message: 'The request was successful, but no note with that title was found.',
    id: 'notFound',
  };

  if (notes[params.title]) respondJSON(request, response, 200, notes[params.title]);
  else respondJSON(request, response, 404, responseJSON);
};

// HEAD request for retrieving notes
const getNoteMeta = (request, response, params) => {
  if (notes[params.title]) respondJSONMeta(request, response, 200);
  else respondJSONMeta(request, response, 404);
};

// 404 get request
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you were looking for was not found.',
    id: 'notFound',
  };

  return respondJSON(request, response, 404, responseJSON);
};

// 404 head request
const notFoundMeta = (request, response) => respondJSONMeta(request, response, 404);

module.exports = {
  getNote,
  getNoteMeta,
  addNote,
  notFound,
  notFoundMeta,
};
