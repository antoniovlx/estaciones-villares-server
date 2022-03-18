
const mqtt = require('mqtt')

function initMQTTConnection() {
    const client = mqtt.connect(process.env.MQTT_BROKE_URL, {
        username: process.env.MQTT_USER,
        password: process.env.MQTT_KEY
    })

    client.on('connect', function () {
        console.log("connected")
        client.subscribe('#', function (err) {
            if (!err) {
                console.log('subscribed')
            }
        })
    })
    return client;
}

module.exports.client = initMQTTConnection();



