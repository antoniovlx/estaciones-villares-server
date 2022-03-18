const moment = require('moment-timezone');

function formatDate(date) {
    date = date.replace(' ', '+')
    return moment.tz(date, 'Europe/Madrid').format()
}

module.exports = formatDate
