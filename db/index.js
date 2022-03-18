const db = require('./db')

module.exports = {
  getAll: db.getAll,
  search: db.search,
  save: db.save,
  getStations: db.getStations
}