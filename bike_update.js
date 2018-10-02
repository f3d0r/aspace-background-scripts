require('module-alias/register');

var sql = require('@sql');
const constants = require('@config')

function sessionUpdate(callback) {
    const end_session_count = constants.sessions.end_session_threshold * 60000 / constants.sessions.update_interval.toString();
    // console.log(end_session_count)
    var sql_cmd = `UPDATE routing_sessions SET counter = counter + 1, status = (CASE WHEN counter >` + end_session_count + ` THEN 1 ELSE status END);`
    sql_cmd += `SELECT session_id, parking_dest FROM routing_sessions WHERE mode = 'bike' AND status = 0;`
    sql.runRaw(sql_cmd, function (results) {
        // [ OkPacket {...}, RowDataPacket { session_id: 34, parking_dest: '-122.319,47.6062' } ]
        results = results[1]
        if (results.length != 0) {

            var coords = results.map(val => val.parking_dest)
            coords = coords.map(val => val.split(','))
            coords = coords.map(val => [parseFloat(val[0]), parseFloat(val[1])])
            // console.log(results)

            sql.select.selectMultiRadius('bike_locs', coords, 650 / 5280, function (bike_data) {
                // count number of bikes around each parking spot here, and push that with results to bike_data.
                // console.log(bike_data)
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
        } else {
            // No sessions require updating
            callback();
        }
    }, function (error) {
        console.error('RUN RAW SQL SELECT ERROR: ' + error.message);
    });
}

function wait() {
    setTimeout(function () {
        sessionUpdate(wait);
    }, constants.sessions.update_interval);
}

sessionUpdate(wait);