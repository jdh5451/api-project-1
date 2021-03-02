const users = {};

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
// start by assuming invalid parameters
  const responseJSON = {
    message: 'Both title and content are required.',
  };

  // check for parameters, if missing return 400 bad request
  if (!body.title || !body.content) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  } else if(!body.user){
    responseJSON.message='You are not logged in. Please log in again.';
    responseJSON.id='unauthorized';
    return respondJSON(request, response, 401, responseJSON);
  }
  // assume user is creating a new note
  let responseCode = 201;

  // check for an existing title, if title exists send back 204 and update
  if (users[body.user].notes[body.title]) {
    responseCode = 204;
  } else {
    users[body.user].notes[body.title] = {};
    users[body.user].notes[body.title].title = body.title;
  }

  // update content
  users[body.user].notes[body.title].content = body.content;

  // send back 201
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
    
  if(!params.user){
    responseJSON.message='You are not logged in. Please log in again.';
    responseJSON.id='unauthorized';
    return respondJSON(request, response, 401, responseJSON);
  }

  if (users[params.user].notes[params.title]) respondJSON(request, response, 200, users[params.user].notes[params.title]);
  else respondJSON(request, response, 404, responseJSON);
};

// HEAD request for retrieving notes
const getNoteMeta = (request, response, params) => {
  if(!params.user) respondJSONMeta(request, response, 401);
  else if (users[params.user].notes[params.title]) respondJSONMeta(request, response, 200);
  else respondJSONMeta(request, response, 404);
};

//GET request for retrieving user data
const getUser = (request, response, params) => {
//assume user has not provided both username and password
  const responseJSON = {
    message: 'Both username and password are required.',
  };
//check if user has provided both username and password. if they haven't, tell them to try again
  if (!params.user||!params.pass){
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  } 
//check if user has logged in with the password that matches their username. if password doesn't match, inform them of such.
  else if(users[params.user] && !(users[params.user].pass===params.pass)){
    responseJSON.message='Incorrect password. If you are attempting to make a new account, try a different username.';
    responseJSON.id='wrongPassword';
    return respondJSON(request, response, 401, responseJSON);
  }
    
  
};

// HEAD request for retrieving user data
const getUserMeta = (request, response, params) => {
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
  getUser,
  getUserMeta,
  addNote,
  notFound,
  notFoundMeta,
};
