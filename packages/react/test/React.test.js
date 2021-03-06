//this is needed for testing, which allows JSX to be transpiled on the server
require('@babel/polyfill');

const http = require('http');
const fetch = require('node-fetch');

const React = require('react');
const { renderToString } = require('react-dom/server');

const react = require('../src/index');
const geum = require('@geum/http');

const Header = require('./assets/Header.jsx');
const Header2 = require('./assets/Header2.jsx');

test('create element understanding test', async() => {
  //header is an element
  let actual = renderToString(React.createElement('div', {}, Header));
  expect(actual.indexOf('h1') !== -1).toBe(true);
  expect(actual.indexOf('Hello World') !== -1).toBe(true);

  //header is a component
  actual = renderToString(React.createElement(Header2, {}));
  expect(actual.indexOf('h1') !== -1).toBe(true);
  expect(actual.indexOf('Hello World') !== -1).toBe(true);
});

test('http test', async() => {
  const app = geum();
  app.use(react());

  //make some routes
  app.route('/some/path').post((req, res) => {
    res.setComponent(Header);
  });

  //default
  const server = http.createServer(app);

  //as soon as the server is called and responded, close the server
  app.on('close', () => { server.close() });

  //listen to server
  server.listen(3000);

  const response = await fetch('http://127.0.0.1:3000/some/path?lets=dothis', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      //'Content-Type': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: 'foo=bar&zoo[]=1&zoo[]=2&zoo[]=3', // body data type must match "Content-Type" header
  });

  const actual = await response.text();

  expect(actual.indexOf('h1') === 1).toBe(true);
  expect(actual.indexOf('Hello World') !== -1).toBe(true);
});
