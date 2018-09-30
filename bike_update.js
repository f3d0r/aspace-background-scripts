// require('module-alias/register');

let mysql = require('mysql');
const constants = require('./config');
var sql = require('./database/sqlActions');

let connection = mysql.createConnection({
    host: constants.db.DATABASE_IP,
    user: 'yousif',
    password: '4R2@H2E6RIyp*hQHc3$J7$CHbHL0WSI#iDQnl&^0HkOeLcSOPhiq#EXow&B6Yuo*',
    database: constants.db.DATABASE_NAME
});

// connect to the MySQL server
connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    sql = `SELECT session_id, parking_dest FROM routing_sessions WHERE mode='bike' AND status=0`;
    connection.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log(results.length)
        console.log(results)
        // [ RowDataPacket { session_id: 34, parking_dest: '-122.319,47.6062' } ]
        
        var coords = results.map( val => val.parking_dest)
        coords = coords.map(val => val.split(','))
        coords = coords.map(val => [parseFloat(val[0]), parseFloat(val[1])])
        console.log(coords);
        // (database, coords, miles, successCB, noneFoundCB, failCB)
        sql.select.selectMultiRadius('bike_locs', coords, 650/5280, function (results) {
            // count number of bikes around each parking spot here, and push that with results to bike_data.
            // these counts will have to be pushed as a parameter into X, so it's important to figure out
            // the correct threading and sequence for this routine. may require changes.
            var num_bike_list = []
            for (i in results) {
                var num_bikes = 0
                for (j in results[i]) {
                    num_bikes = num_bikes + results[i][j].bikes_available
                }
                num_bike_list.push(num_bikes)
            }
            bike_data = results.map((e, i) => [e, num_bike_list[i]]);
            console.log(num_bike_list)
        }, function () {
            console.log('None found')
        }, function (err) {
            console.log(err)
        });

        connection.end();
    })
})