'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub,
      _ref$properties = _ref.properties,
      properties = _ref$properties === undefined ? {} : _ref$properties;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub, properties: properties });

  var props = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propsToScrub = scrub;
    if (!Array.isArray(propsToScrub)) {
      propsToScrub = (0, _keys2.default)(props).filter(function (prop) {
        return !props[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propsToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, (0, _extends7.default)({ type: Date, required: false }, properties));

  Model.destroyAll = function softDestroyAll(where, cb) {
    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    return Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, null);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  Model.countAll = function countAll() {
    for (var _len4 = arguments.length, rest = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      rest[_key4] = arguments[_key4];
    }

    return _count.call.apply(_count, [Model].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len5 = arguments.length, rest = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      rest[_key5 - 1] = arguments[_key5];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsInByb3BlcnRpZXMiLCJtb2RlbE5hbWUiLCJwcm9wcyIsImRlZmluaXRpb24iLCJpZE5hbWUiLCJkYXRhU291cmNlIiwic2NydWJiZWQiLCJwcm9wc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVzdHJveUFsbCIsInNvZnREZXN0cm95QWxsIiwid2hlcmUiLCJjYiIsInVwZGF0ZUFsbCIsInRoZW4iLCJyZXN1bHQiLCJjYXRjaCIsImVycm9yIiwicmVqZWN0IiwicmVtb3ZlIiwiZGVsZXRlQWxsIiwiZGVzdHJveUJ5SWQiLCJzb2Z0RGVzdHJveUJ5SWQiLCJpZCIsInJlbW92ZUJ5SWQiLCJkZWxldGVCeUlkIiwicHJvdG90eXBlIiwiZGVzdHJveSIsInNvZnREZXN0cm95Iiwib3B0aW9ucyIsImNhbGxiYWNrIiwidW5kZWZpbmVkIiwidXBkYXRlQXR0cmlidXRlcyIsImRlbGV0ZSIsInF1ZXJ5Tm9uRGVsZXRlZCIsIl9maW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGVEZWxldGVkIiwicXVlcnkiLCJkZWxldGVkIiwibGVuZ3RoIiwiYW5kIiwicmVzdCIsImNhbGwiLCJfZmluZCIsImZpbmQiLCJmaW5kRGVsZXRlZCIsIl9jb3VudCIsImNvdW50IiwiY291bnREZWxldGVkIiwid2hlcmVOb3REZWxldGVkIiwiY291bnRBbGwiLCJfdXBkYXRlIiwidXBkYXRlIiwidXBkYXRlRGVsZXRlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFDQSxJQUFNQSxRQUFRLHNCQUFkOztrQkFFZSxVQUFDQyxLQUFELFFBQXdFO0FBQUEsNEJBQTlEQyxTQUE4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QUNELEtBRkQsTUFFTztBQUNMZ0Isd0JBQWtCLEVBQUVULEtBQUssQ0FBRTlCLEtBQUYsRUFBU3VCLGVBQVQsQ0FBUCxFQUFsQjtBQUNEOztBQVBzRCx1Q0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBUXZELFdBQU9LLE9BQU9KLElBQVAsZ0JBQVl2RCxLQUFaLEVBQW1COEQsZUFBbkIsU0FBdUNSLElBQXZDLEVBQVA7QUFDRCxHQVREOztBQVdBdEQsUUFBTStELFFBQU4sR0FBaUIsU0FBU0EsUUFBVCxHQUE0QjtBQUFBLHVDQUFOVCxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFDM0MsV0FBT0ssT0FBT0osSUFBUCxnQkFBWXZELEtBQVosU0FBc0JzRCxJQUF0QixFQUFQO0FBQ0QsR0FGRDs7QUFJQSxNQUFNVSxVQUFVaEUsTUFBTWlFLE1BQXRCO0FBQ0FqRSxRQUFNaUUsTUFBTixHQUFlakUsTUFBTXlCLFNBQU4sR0FBa0IsU0FBU3lDLGFBQVQsR0FBNEM7QUFBQSxRQUFyQjNDLEtBQXFCLHVFQUFiLEVBQWE7O0FBQzNFO0FBQ0EsUUFBSXVDLHdCQUFKO0FBQ0EsUUFBSSxDQUFDdkMsS0FBRCxJQUFVLG9CQUFZQSxLQUFaLEVBQW1CNkIsTUFBbkIsS0FBOEIsQ0FBNUMsRUFBK0M7QUFDN0NVLHdCQUFrQmhCLGVBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0xnQix3QkFBa0IsRUFBRVQsS0FBSyxDQUFFOUIsS0FBRixFQUFTdUIsZUFBVCxDQUFQLEVBQWxCO0FBQ0Q7O0FBUDBFLHVDQUFOUSxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFRM0UsV0FBT1UsUUFBUVQsSUFBUixpQkFBYXZELEtBQWIsRUFBb0I4RCxlQUFwQixTQUF3Q1IsSUFBeEMsRUFBUDtBQUNELEdBVEQ7QUFVRCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0Jywgc2NydWIgPSBmYWxzZSwgcHJvcGVydGllcyA9IHt9IH0pID0+IHtcbiAgZGVidWcoJ1NvZnREZWxldGUgbWl4aW4gZm9yIE1vZGVsICVzJywgTW9kZWwubW9kZWxOYW1lKTtcblxuICBkZWJ1Zygnb3B0aW9ucycsIHsgZGVsZXRlZEF0LCBzY3J1YiwgcHJvcGVydGllcyB9KTtcblxuICBjb25zdCBwcm9wcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcbiAgY29uc3QgaWROYW1lID0gTW9kZWwuZGF0YVNvdXJjZS5pZE5hbWUoTW9kZWwubW9kZWxOYW1lKTtcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wc1RvU2NydWIgPSBzY3J1YjtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcHNUb1NjcnViKSkge1xuICAgICAgcHJvcHNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcHMpXG4gICAgICAgIC5maWx0ZXIocHJvcCA9PiAhcHJvcHNbcHJvcF1baWROYW1lXSAmJiBwcm9wICE9PSBkZWxldGVkQXQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BzVG9TY3J1Yi5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4gKHsgLi4ub2JqLCBbcHJvcF06IG51bGwgfSksIHt9KTtcbiAgfVxuXG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KGRlbGV0ZWRBdCwgeyB0eXBlOiBEYXRlLCByZXF1aXJlZDogZmFsc2UsIC4uLnByb3BlcnRpZXMgfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmUgPSBNb2RlbC5kZXN0cm95QWxsO1xuICBNb2RlbC5kZWxldGVBbGwgPSBNb2RlbC5kZXN0cm95QWxsO1xuXG4gIE1vZGVsLmRlc3Ryb3lCeUlkID0gZnVuY3Rpb24gc29mdERlc3Ryb3lCeUlkKGlkLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIE1vZGVsLmNvdW50QWxsID0gZnVuY3Rpb24gY291bnRBbGwgKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gX2NvdW50LmNhbGwoTW9kZWwsIC4uLnJlc3QpXG4gIH1cblxuICBjb25zdCBfdXBkYXRlID0gTW9kZWwudXBkYXRlO1xuICBNb2RlbC51cGRhdGUgPSBNb2RlbC51cGRhdGVBbGwgPSBmdW5jdGlvbiB1cGRhdGVEZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIHVwZGF0ZS91cGRhdGVBbGwgb25seSByZWNlaXZlcyBhICd3aGVyZScsIHRoZXJlJ3Mgbm93aGVyZSB0byBhc2sgZm9yIHRoZSBkZWxldGVkIGVudGl0aWVzLlxuICAgIGxldCB3aGVyZU5vdERlbGV0ZWQ7XG4gICAgaWYgKCF3aGVyZSB8fCBPYmplY3Qua2V5cyh3aGVyZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHsgYW5kOiBbIHdoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgIH1cbiAgICByZXR1cm4gX3VwZGF0ZS5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xufTtcbiJdfQ==
