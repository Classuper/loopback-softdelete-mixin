'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _softDelete = require('./soft-delete');

var _softDelete2 = _interopRequireDefault(_softDelete);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _util.deprecate)(function (app) {
  return app.loopback.modelBuilder.mixins.define('SoftDelete', _softDelete2.default);
}, 'DEPRECATED: Use mixinSources, see https://github.com/clarkbw/loopback-ds-timestamp-mixin#mixinsources');
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbImFwcCIsImxvb3BiYWNrIiwibW9kZWxCdWlsZGVyIiwibWl4aW5zIiwiZGVmaW5lIiwic29mdGRlbGV0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7OztrQkFFZSxxQkFDYjtBQUFBLFNBQU9BLElBQUlDLFFBQUosQ0FBYUMsWUFBYixDQUEwQkMsTUFBMUIsQ0FBaUNDLE1BQWpDLENBQXdDLFlBQXhDLEVBQXNEQyxvQkFBdEQsQ0FBUDtBQUFBLENBRGEsRUFFYix1R0FGYSxDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVwcmVjYXRlIH0gZnJvbSAndXRpbCc7XG5pbXBvcnQgc29mdGRlbGV0ZSBmcm9tICcuL3NvZnQtZGVsZXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVwcmVjYXRlKFxuICBhcHAgPT4gYXBwLmxvb3BiYWNrLm1vZGVsQnVpbGRlci5taXhpbnMuZGVmaW5lKCdTb2Z0RGVsZXRlJywgc29mdGRlbGV0ZSksXG4gICdERVBSRUNBVEVEOiBVc2UgbWl4aW5Tb3VyY2VzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2NsYXJrYncvbG9vcGJhY2stZHMtdGltZXN0YW1wLW1peGluI21peGluc291cmNlcydcbik7XG4iXX0=
