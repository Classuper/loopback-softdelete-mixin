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
  Model._find = function _find() {
    for (var _len3 = arguments.length, rest = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      rest[_key3] = arguments[_key3];
    }

    return _find.call.apply(_find, [Model].concat(rest));
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

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };
  Model._count = function _count() {
    for (var _len5 = arguments.length, rest = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      rest[_key5] = arguments[_key5];
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

    for (var _len6 = arguments.length, rest = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
      rest[_key6 - 1] = arguments[_key6];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsInByb3BlcnRpZXMiLCJtb2RlbE5hbWUiLCJwcm9wcyIsImRlZmluaXRpb24iLCJpZE5hbWUiLCJkYXRhU291cmNlIiwic2NydWJiZWQiLCJwcm9wc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVzdHJveUFsbCIsInNvZnREZXN0cm95QWxsIiwid2hlcmUiLCJjYiIsInVwZGF0ZUFsbCIsInRoZW4iLCJyZXN1bHQiLCJjYXRjaCIsImVycm9yIiwicmVqZWN0IiwicmVtb3ZlIiwiZGVsZXRlQWxsIiwiZGVzdHJveUJ5SWQiLCJzb2Z0RGVzdHJveUJ5SWQiLCJpZCIsInJlbW92ZUJ5SWQiLCJkZWxldGVCeUlkIiwicHJvdG90eXBlIiwiZGVzdHJveSIsInNvZnREZXN0cm95Iiwib3B0aW9ucyIsImNhbGxiYWNrIiwidW5kZWZpbmVkIiwidXBkYXRlQXR0cmlidXRlcyIsImRlbGV0ZSIsInF1ZXJ5Tm9uRGVsZXRlZCIsIl9maW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGVEZWxldGVkIiwicXVlcnkiLCJkZWxldGVkIiwibGVuZ3RoIiwiYW5kIiwicmVzdCIsImNhbGwiLCJfZmluZCIsImZpbmQiLCJmaW5kRGVsZXRlZCIsIl9jb3VudCIsImNvdW50IiwiY291bnREZWxldGVkIiwid2hlcmVOb3REZWxldGVkIiwiX3VwZGF0ZSIsInVwZGF0ZSIsInVwZGF0ZURlbGV0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBQ0EsSUFBTUEsUUFBUSxzQkFBZDs7a0JBRWUsVUFBQ0MsS0FBRCxRQUF3RTtBQUFBLDRCQUE5REMsU0FBOEQ7QUFBQSxNQUE5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RCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0Jywgc2NydWIgPSBmYWxzZSwgcHJvcGVydGllcyA9IHt9IH0pID0+IHtcbiAgZGVidWcoJ1NvZnREZWxldGUgbWl4aW4gZm9yIE1vZGVsICVzJywgTW9kZWwubW9kZWxOYW1lKTtcblxuICBkZWJ1Zygnb3B0aW9ucycsIHsgZGVsZXRlZEF0LCBzY3J1YiwgcHJvcGVydGllcyB9KTtcblxuICBjb25zdCBwcm9wcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcbiAgY29uc3QgaWROYW1lID0gTW9kZWwuZGF0YVNvdXJjZS5pZE5hbWUoTW9kZWwubW9kZWxOYW1lKTtcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wc1RvU2NydWIgPSBzY3J1YjtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcHNUb1NjcnViKSkge1xuICAgICAgcHJvcHNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcHMpXG4gICAgICAgIC5maWx0ZXIocHJvcCA9PiAhcHJvcHNbcHJvcF1baWROYW1lXSAmJiBwcm9wICE9PSBkZWxldGVkQXQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BzVG9TY3J1Yi5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4gKHsgLi4ub2JqLCBbcHJvcF06IG51bGwgfSksIHt9KTtcbiAgfVxuXG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KGRlbGV0ZWRBdCwgeyB0eXBlOiBEYXRlLCByZXF1aXJlZDogZmFsc2UsIC4uLnByb3BlcnRpZXMgfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmUgPSBNb2RlbC5kZXN0cm95QWxsO1xuICBNb2RlbC5kZWxldGVBbGwgPSBNb2RlbC5kZXN0cm95QWxsO1xuXG4gIE1vZGVsLmRlc3Ryb3lCeUlkID0gZnVuY3Rpb24gc29mdERlc3Ryb3lCeUlkKGlkLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG4gIE1vZGVsLl9maW5kID0gZnVuY3Rpb24gX2ZpbmQgKC4uLnJlc3QpIHtcbiAgICByZXR1cm4gX2ZpbmQuY2FsbChNb2RlbCwgLi4ucmVzdClcbiAgfVxuXG4gIGNvbnN0IF9jb3VudCA9IE1vZGVsLmNvdW50O1xuICBNb2RlbC5jb3VudCA9IGZ1bmN0aW9uIGNvdW50RGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSBjb3VudCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgbGV0IHdoZXJlTm90RGVsZXRlZDtcbiAgICBpZiAoIXdoZXJlIHx8IE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFsgd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuICAgIHJldHVybiBfY291bnQuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcbiAgTW9kZWwuX2NvdW50ID0gZnVuY3Rpb24gX2NvdW50ICguLi5yZXN0KSB7XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCAuLi5yZXN0KVxuICB9XG5cbiAgY29uc3QgX3VwZGF0ZSA9IE1vZGVsLnVwZGF0ZTtcbiAgTW9kZWwudXBkYXRlID0gTW9kZWwudXBkYXRlQWxsID0gZnVuY3Rpb24gdXBkYXRlRGVsZXRlZCh3aGVyZSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgLy8gQmVjYXVzZSB1cGRhdGUvdXBkYXRlQWxsIG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF91cGRhdGUuY2FsbChNb2RlbCwgd2hlcmVOb3REZWxldGVkLCAuLi5yZXN0KTtcbiAgfTtcbn07XG4iXX0=
