const formatDate = require('../util');

const sqlite3 = require('sqlite3').verbose();

function connect(){
  return new sqlite3.Database('./data/estaciones-cilifo.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
  });
}

module.exports.getAll = callback => {
  let db = connect();
  const sql = `SELECT * FROM data ORDER BY receiveAt DESC`;
  console.log(sql);
  db.all(sql, (err, data) => {
    if (err) console.error(err.message)
    callback(data);
  });

  db.close();
}


module.exports.search = (callback, params) => {
  let db = connect();
  
  paramsQuery = [formatDate(params["dateStart"]), formatDate(params["dateEnd"])]
  
  let sql = `SELECT * FROM data WHERE receiveAt > ?` +
  ` AND receiveAt < ? `;

  if(params['deviceUid'] !== undefined){
    sql += ' AND deviceUid LIKE ?';
    paramsQuery.push(['%' + params['deviceUid'] + '%']);
  }
  sql += ' ORDER BY receiveAt DESC';

  console.log(sql);

  db.all(sql, paramsQuery, (err, data) => {
    if (err) {
      console.log('Error running sql: ' + sql)
      console.log(err)
      reject(err)
    } else {
      callback(data)
    }
  });
  
  db.close();
}

module.exports.save = data => {
  let db = connect();
 
  const sql = `INSERT INTO data(receiveAt, deviceUid, wind, hr, temperature) ` +
  ` VALUES('${formatDate(data['received_at'])}', '${data['end_device_ids']['device_id']}', '${data['uplink_message']['decoded_payload']['analog_in_1']}', '${data['uplink_message']['decoded_payload']['relative_humidity_2']}', '${data['uplink_message']['decoded_payload']['temperature_3']}')`;
  console.log(sql);
  
  db.run(sql, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Rows inserted ${this.changes}`);
  });

  db.close();
}

module.exports.getStations = callback => {
  let db = connect();
  const sql = `SELECT DISTINCT deviceUid FROM data ORDER BY deviceUid`;
  console.log(sql);
  db.all(sql, (err, data) => {
    if (err) console.error(err.message)
    callback(data);
  });

  db.close();
}





