require('module-alias/register');

var sql = require('@sql');
const constants = require('@config')
const errors = require('@errors')

function sessionUpdate(callback) {
    sql.runRaw(`SELECT session_id, parking_dest FROM routing_sessions WHERE mode='bike' AND status=0`, function (results) {
        // [ RowDataPacket { session_id: 34, parking_dest: '-122.319,47.6062' } ]

        var coords = results.map(val => val.parking_dest)
        coords = coords.map(val => val.split(','))
        coords = coords.map(val => [parseFloat(val[0]), parseFloat(val[1])])

        // (database, coords, miles, successCB, noneFoundCB, failCB)
        sql.select.selectMultiRadius('bike_locs', coords, 650 / 5280, function (bike_data) {
            // count number of bikes around each parking spot here, and push that with results to bike_data.

            if (bike_data.length == 1) {
                bike_data = [bike_data];
            }
            var num_bike_list = []
            for (i in bike_data) {
                var num_bikes = 0
                for (j in bike_data[i]) {
                    num_bikes = num_bikes + bike_data[i][j].bikes_available
                }
                num_bike_list.push(num_bikes)
            }
            update_data = num_bike_list.map((e, i) => [e, results[i].session_id]);
            update_data = [].concat.apply([], update_data);
            // console.log(update_data)
            sql.update.bikeQuantityUpdate(update_data, function (result) {
                // console.log('success')
                callback();
            }, function (err) {
                console.log("BIKE QUANTITY UPDATE ERROR: " + JSON.stringify(err));
            });
        }, function () {
            console.log('NO BIKES RETRIEVED AROUND ANY PARKING DEST');
            callback();
        }, function (err) {
            console.log('SELECT MULTI RADIUS ERROR: ' + JSON.stringify(err));
        });
    }, function (error) {
        return console.error('RUN RAW SQL SELECT ERROR: ' + err.message);
    });
}

function wait() {
    setTimeout(function () {
        sessionUpdate(wait);
    }, constants.sessions.update_interval);
}

sessionUpdate(wait);