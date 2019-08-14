const Definition = require('./Definition');

const EventEmitter = require('./EventEmitter');

const Route = require('./router/Route');
const Request = require('./router/Request');
const Response = require('./router/Response');

/**
 * A router parses a request and determines
 * where and what to route to matching callbacks
 */
class Router extends EventEmitter {
  /**
   * Static loader
   *
   * @return {Router}
   */
  static load() {
    return new Router();
  }

  /**
   * Sets the default state of listeners
   */
  constructor() {
    super();

    this.RouteInterace = Router.RouteInterace;
    this.RequestInterface = Router.RequestInterface;
    this.ResponseInterface = Router.ResponseInterface;
  }

  /**
   * Returns a route
   *
   * @param {String} event
   * @param {Request} [request = null]
   * @param {Response} [response = null]
   *
   * @return {Route}
   */
  route(event, request = null, response = null) {
    const route = new this.RouteInterace(this, event);

    //if its not a request
    if (!Definition(request).instanceOf(Request)) {
      //if it's an array
      if (Array.isArray(request)) {
        route.args = request;
      } else if (typeof request === 'object' && request !== null) {
        route.parameters = Object.assign({}, request);
      }

      //make a request
      request = new this.RequestInterface();
    }

    //if its not a response
    if (!Definition(response).instanceOf(Response)) {
      //make a response
      response = new this.ResponseInterface();
    }

    //set the request and response
    route.request = request;
    route.response = response;

    return route;
  }

  /**
   * Shortcut for middleware
   *
   * @param {Function} [callback]
   * @param {Integer} [priority = 1]
   *
   * @return {Framework}
   */
  use(callback, priority = 0) {
    //if priority is not a number ie. EventEmitter, Router, etc.
    //or there are more than 2 arguments...
    if (typeof priority !== 'number' || arguments.length > 2) {
      //set the priority to 0
      priority = 0;

      //loop through each argument as callback
      Array.from(arguments).forEach((callback, index) => {
        //if the callback is an array
        if (Array.isArray(callback)) {
          //recall use()
          this.use(...callback);
          return;
        }

        //determine the priority
        if (typeof arguments[index + 1] === 'number') {
          priority = arguments[index + 1];
        }

        //recall use() in a singular way
        this.use(callback, priority);
      });

      return this;
    }

    //make sure priority is a number
    if (typeof priority !== 'number') {
      priority = 0;
    }

    //if the callback is an EventEmitter
    if (Definition(callback).instanceOf(EventEmitter)) {
      Object.keys(callback.listeners).forEach(event => {
        this.on(event, (...args) => {
          callback.emit(event, ...args);
        }, priority);
      });

      return this;
    }

    //if a callback is not a function
    if (typeof callback === 'function') {
      this.on('request', callback, priority);
    }

    return this;
  }

  /**
   * Runs an event like a method
   *
   * @param {String} event
   * @param {Request} [request = null]
   * @param {Response} [response = null]
   *
   * @return {*}
   */
  async request(event, request = null, response = null) {
    //make the route
    const route = this.route(event, request, response);

    //run the route
    response = await route.emit();

    //if theres an error
    if (response.hasError()) {
        return false;
    }

    return response.getResults();
  }
}

//allows interfaces to be manually changed
Router.RouteInterace = Route;
Router.RequestInterface = Request;
Router.ResponseInterface = Response;

//adapter
module.exports = Router;
