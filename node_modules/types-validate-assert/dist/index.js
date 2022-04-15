(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define('index', ['exports'], factory) :
    (global = global || self, factory(global.index = {}));
}(this, (function (exports) { 'use strict';

    class ValidateTypes {
      constructor() {}

      getType(value) {
        return Object.prototype.toString.call(value);
      }

      getClassName(value) {
        try {
          return value.constructor.name;
        } catch (e) {}

        return this.getType(value);
      } //Validation functions


      isObject(value) {
        if (this.getType(value) === "[object Object]") return true;
        return false;
      }

      isFunction(value) {
        if (this.getType(value) === "[object Function]") return true;
        return false;
      }

      isString(value) {
        if (this.getType(value) === "[object String]") return true;
        return false;
      }

      isBoolean(value) {
        if (this.getType(value) === "[object Boolean]") return true;
        return false;
      }

      isArray(value) {
        if (this.getType(value) === "[object Array]") return true;
        return false;
      }

      isNumber(value) {
        if (this.getType(value) === "[object Number]") return true;
        return false;
      }

      isInteger(value) {
        if (this.getType(value) === "[object Number]" && Number.isInteger(value)) return true;
        return false;
      }

      isRegEx(value) {
        if (this.getType(value) === "[object RegExp]") return true;
        return false;
      }

      isStringHex(value) {
        if (!this.isStringWithValue(value)) return false;
        let hexRegEx = /([0-9]|[a-f])/gim;
        return (value.match(hexRegEx) || []).length === value.length;
      }

      hasKeys(value, keys) {
        if (keys.map(key => key in value).includes(false)) return false;
        return true;
      }

      isStringWithValue(value) {
        if (this.isString(value) && value !== '') return true;
        return false;
      }

      isObjectWithKeys(value) {
        if (this.isObject(value) && Object.keys(value).length > 0) return true;
        return false;
      }

      isArrayWithValues(value) {
        if (this.isArray(value) && value.length > 0) return true;
        return false;
      }

      isSpecificClass(value, className) {
        if (!this.isObject(value)) return false;
        if (this.getClassName(value) !== className) return false;
        return true;
      }

    }

    class AssertTypes {
      constructor() {
        this.validate = new ValidateTypes();
      } //Validation functions


      isObject(value) {
        if (!this.validate.isObject(value)) {
          throw new TypeError(`Expected type [object Object] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isFunction(value) {
        if (!this.validate.isFunction(value)) {
          throw new TypeError(`Expected type [object Function] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isString(value) {
        if (!this.validate.isString(value)) {
          throw new TypeError(`Expected type [object String] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isBoolean(value) {
        if (!this.validate.isBoolean(value)) {
          throw new TypeError(`Expected type [object Boolean] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isArray(value) {
        if (!this.validate.isArray(value)) {
          throw new TypeError(`Expected type [object Array] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isNumber(value) {
        if (!this.validate.isNumber(value)) {
          throw new TypeError(`Expected type [object Number] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isInteger(value) {
        if (!this.validate.isInteger(value)) {
          throw new TypeError(`Expected "${value}" to be an integer but got non-integer value`);
        }

        return true;
      }

      isRegEx(value) {
        if (!this.validate.isRegEx(value)) {
          throw new TypeError(`Expected type [object RegExp] but got ${this.validate.getType(value)}`);
        }

        return true;
      }

      isStringHex(value) {
        if (!this.validate.isStringHex(value)) {
          throw new TypeError(`Expected "${value}" to be hex but got non-hex value`);
        }

        return true;
      }

      hasKeys(value, keys) {
        if (!this.validate.hasKeys(value, keys)) {
          throw new TypeError(`Provided object does not contain all keys ${JSON.stringify(keys)}`);
        }

        return true;
      }

      isStringWithValue(value) {
        if (!this.validate.isStringWithValue(value)) {
          throw new TypeError(`Expected "${value}" to be [object String] and not empty`);
        }

        return true;
      }

      isObjectWithKeys(value) {
        if (!this.validate.isObjectWithKeys(value)) {
          throw new TypeError(`Expected "${value}" to be [object Object] and have keys`);
        }

        return true;
      }

      isArrayWithValues(value) {
        if (!this.validate.isArrayWithValues(value)) {
          throw new TypeError(`Expected "${value}" to be [object Array] and not empty`);
        }

        return true;
      }

      isSpecificClass(value, className) {
        if (!this.validate.isSpecificClass(value, className)) {
          throw new TypeError(`Expected Object Class to be "${className}" but got ${this.validate.getClassName(value)}`);
        }

        return true;
      }

    }

    const validateTypes = new ValidateTypes();
    const assertTypes = new AssertTypes();

    exports.assertTypes = assertTypes;
    exports.validateTypes = validateTypes;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
