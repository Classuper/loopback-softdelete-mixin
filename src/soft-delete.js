import _debug from './debug'

const debug = _debug()

export default (Model, { deletedAt = 'deletedAt', scrub = false, properties = {} }) => {
  debug('SoftDelete mixin for Model %s', Model.modelName)

  debug('options', { deletedAt, scrub, properties })

  const props = Model.definition.properties
  const idName = Model.dataSource.idName(Model.modelName)

  let scrubbed = {}
  if (scrub !== false) {
    let propsToScrub = scrub
    if (!Array.isArray(propsToScrub)) {
      propsToScrub = Object.keys(props)
        .filter((prop) => !props[prop][idName] && prop !== deletedAt)
    }
    scrubbed = propsToScrub.reduce((obj, prop) => ({ ...obj, [prop]: null }), {})
  }

  Model.defineProperty(deletedAt, { type: Date, required: false, ...properties })

  const _destroyAll = Model.destroyAll
  Model.destroyAll = function softDestroyAll (where, cb) {
    return Model.updateAll(where, { ...scrubbed, [deletedAt]: new Date() })
      .then((result) => ((typeof cb === 'function') ? cb(null, result) : result))
      .catch((error) => ((typeof cb === 'function') ? cb(error) : Promise.reject(error)))
  }

  Model.remove = Model.destroyAll
  Model.deleteAll = Model.destroyAll

  const _destroyById = Model.destroyById
  Model.destroyById = function softDestroyById (id, cb) {
    return Model.updateAll({ [idName]: id }, { ...scrubbed, [deletedAt]: new Date() })
      .then((result) => ((typeof cb === 'function') ? cb(null, result) : result))
      .catch((error) => ((typeof cb === 'function') ? cb(error) : Promise.reject(error)))
  }

  Model.removeById = Model.destroyById
  Model.deleteById = Model.destroyById

  const _destroy = Model.prototype.destroy
  Model.prototype.destroy = function softDestroy (options, cb) {
    const callback = (cb === undefined && typeof options === 'function') ? options : cb

    return this.updateAttributes({ ...scrubbed, [deletedAt]: new Date() })
      .then((result) => ((typeof cb === 'function') ? callback(null, result) : result))
      .catch((error) => ((typeof cb === 'function') ? callback(error) : Promise.reject(error)))
  }

  Model.prototype.remove = Model.prototype.destroy
  Model.prototype.delete = Model.prototype.destroy

  // Emulate default scope but with more flexibility.
  const queryNonDeleted = { [deletedAt]: null }

  const _findOrCreate = Model.findOrCreate
  Model.findOrCreate = function findOrCreateDeleted (query = {}, ...rest) {
    if (!query.deleted) {
      if (!query.where || Object.keys(query.where).length === 0) {
        query.where = queryNonDeleted
      } else {
        query.where = { and: [query.where, queryNonDeleted] }
      }
    }

    return _findOrCreate.call(Model, query, ...rest)
  }

  const _find = Model.find
  Model.find = function findDeleted (query = {}, ...rest) {
    if (!query.deleted) {
      if (!query.where || Object.keys(query.where).length === 0) {
        query.where = queryNonDeleted
      } else {
        query.where = { and: [query.where, queryNonDeleted] }
      }
    }

    return _find.call(Model, query, ...rest)
  }

  const _count = Model.count
  Model.count = function countDeleted (where = {}, ...rest) {
    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    let whereNotDeleted
    if (!where || Object.keys(where).length === 0) {
      whereNotDeleted = queryNonDeleted
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] }
    }
    return _count.call(Model, whereNotDeleted, ...rest)
  }

  const _update = Model.update
  Model.update = Model.updateAll = function updateDeleted (where = {}, ...rest) {
    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    let whereNotDeleted
    if (!where || Object.keys(where).length === 0) {
      whereNotDeleted = queryNonDeleted
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] }
    }
    return _update.call(Model, whereNotDeleted, ...rest)
  }

  // Keep access to original loopback methods
  Model._destroyAll = (...rest) => _destroyAll.call(Model, ...rest)
  Model._destroyById = (...rest) => _destroyById.call(Model, ...rest)
  Model._find = (...rest) => _find.call(Model, ...rest)
  Model._count = (...rest) => _count.call(Model, ...rest)

  Model.prototype._destroy = (...rest) => _destroy.call(Model.prototype, ...rest)
}
