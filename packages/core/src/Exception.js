/**
 * Exceptions are used to give more information
 * of an error that has occured
 */
class Exception {
  /**
   * An exception should provide a message and a name
   *
   * @param {String} message
   */
  constructor(message, code = 500) {
    this.message = message;
    this.name = this.constructor.name;
    this.code = code;
    this.errors = {};
  }

  /**
   * General use expressive reasons
   *
   * @param {String} message
   * @param {(...*)} values
   *
   * @return {Exception}
   */
  static for(message, ...values) {
    values.forEach(function(value) {
      message = message.replace('%s', value);
    });

    return new this(message);
  }

  /**
   * Expressive error report
   *
   * @param {*}
   *
   * @return {Exception}
   */
  static forErrorsFound(errors) {
    const exception = new this('Invalid Parameters: ' + JSON.stringify(errors));
    exception.errors = errors;
    return exception;
  }

  /**
   * Expressive argument type mismatch
   *
   * @param {Integer} index
   * @param {*} expected
   * @param {*} value
   *
   * @return {Exception}
   */
  static forInvalidArgument(index, expected, actual) {
    if (typeof expected === 'object') {
      expected = expected.constructor.name;
    } else if (typeof expected === 'function') {
      expected = expected.name;
    }

    if (typeof actual === 'object') {
      actual = actual.constructor.name;
    } else if (typeof actual === 'function') {
      actual = actual.name;
    }

    return this.for(
      'Argument %s expecting %s, %s was given',
      index,
      expected,
      actual
    );
  }

  /**
   * Expressive return type mismatch
   *
   * @param {*} expected
   * @param {*} value
   *
   * @return {Exception}
   */
  static forInvalidReturn(expected, actual) {
    if (typeof expected === 'object') {
      expected = expected.constructor.name;
    } else if (typeof expected === 'function') {
      expected = expected.name;
    }

    if (typeof actual === 'object') {
      actual = actual.constructor.name;
    } else if (typeof actual === 'function') {
      actual = actual.name;
    }

    return this.for(
      'Return value expecting %s, %s was given',
      expected,
      actual
    );
  }

  /**
   * 404 expressive error
   *
   * @param {String} key
   * @param {(Integer|String)} id
   *
   * @return {Exception}
   */
  static forNotFound(key, id) {
    return this.for('404 Not Found. (%s: %s)', key, id);
  }

  /**
   * Used in contracts and abstract classes
   *
   * @param {String} method
   *
   * @return {Exception}
   */
  static forUndefinedAbstract(method) {
    return this.for('Undefined abstract %s() called', method);
  }
}

//adapter
module.exports = Exception;
