'use strict';

var mysql = require('mysql');

console.log('Loading function');

var conn;

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

exports.getZipcodeFromLocation = function(coord, callback) {
    console.log('Querying....');
    var lat = -121.705327; //coord.lat;
    var long = 37.189396; //coord.long;
    const dist = 10;
    // rlon1: 36.91363
    // rlon2: 37.4651
    const rlon1 = long - dist/Math.abs(Math.cos(Math.radians(lat)) * 69);
    const rlon2 = long + dist/Math.abs(Math.cos(Math.radians(lat)) * 69);
    const rlat1 = lat - (dist / 69);
    const rlat2 = lat + (dist / 69);
    
    /*set @lat= -121.705327;
    set @lon = 37.189396;
    set @dist = 10;
    set @rlon1 = @lon-@dist/abs(cos(radians(@lat))*69);
    set @rlon2 = @lon+@dist/abs(cos(radians(@lat))*69);
    set @rlat1 = @lat-(@dist/69);
    set @rlat2 = @lat+(@dist/69);*/
    
    var query = 'select ZipCode from ZipCodes where st_within(Coordinate, envelope(linestring(point(?, ?), point(?, ?)))) order by st_distance(point(?, ?), Coordinate) limit 10'
    conn.query(query, 
        [rlon1, rlat1, rlon2, rlat2, long, lat],
         function(err, rows, fields) {
        
        if (err) {
            console.log('Query error:', err);
            callback(err);
            return;
        }
        
        console.log('QUERY SUCCESS! ROW COUNT:', rows.length);        
        callback(null, rows);
    })
}

exports.getCoordinatesForZip = function (zipcode, callback) {

    conn.query('SELECT Coordinate from ZipCodes WHERE ZipCode = ?', [zipcode], function(err, rows, fields) {
        if (err) {
            console.log('Query error:', err);
            callback(err);
            return;
        }
        
        console.log('QUERY SUCCESS! ROW COUNT:', rows.length);        
        callback(null, rows[0]);
    });
};

exports.connect = function(callback) {
    if (!conn) {
        console.log('Creating connection to mysql...');
        conn = mysql.createConnection({
            host     : 'awsreinventteam46-cluster-1.cluster-c8x1imogzrzr.us-west-2.rds.amazonaws.com',
            user     : 'aws2016',
            password : 'aws201646',
            port     : '3306',
            database: 'Aws2016Team46DB'
        });    
    
        console.log('Connecting to mysql...');
        conn.connect(callback);
        console.log('Connected');
    } else {
        callback();
    }
}

exports.getZips = function(zips, callback) {
    var z = zips.map((z) => "'" + z + "'").join(' , ');
    var query = "SELECT * FROM ZipAndScore WHERE Zip IN(" + z + ") ORDER BY Score DESC LIMIT 10";
    var z = zips.map((z) => "'" + z + "'").join(' , ');
    console.log('Z:', z);
    conn.query(query,
        //[z],
        function(err, rows, fields) {
        if (err) {
            console.log('Query error:', err);
            callback(err);
            return;
        }
        
        console.log('QUERY SUCCESS! ROW COUNT:', rows.length);        
        callback(null, rows);
    });
}

var query = function(zipcode, callback) {
    if (!conn) {
        console.log('Creating connection to mysql...');
        conn = mysql.createConnection({
            host     : 'awsreinventteam46-cluster-1.cluster-c8x1imogzrzr.us-west-2.rds.amazonaws.com',
            user     : 'aws2016',
            password : 'aws201646',
            port     : '3306',
            database: 'Aws2016Team46DB'
        });    
    
        console.log('Connecting to mysql...');
        conn.connect(() => getZipcodeFromLocation(zipcode, callback));
        console.log('Connected');
    } else {
        getZipcodeFromLocation(zipcode, callback);
    }
    
    
    
}

var returnTestData = function(callback) {
    var res = {
        scores: [
           { 'zip_code': '94040', 'score': 20, 'rank': 1 },
           { 'zip_code': '94050', 'score': 10, 'rank': 2 },
           { 'zip_code': '94060', 'score': 5,  'rank': 3 },
         ]
    };
    
  callback(null, res);  
};

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    var done = (err, res) => {
        console.log('SENDING RESPONSE.', res);
        callback(null, res);
    };
    
    context.callbackWaitsForEmptyEventLoop = false;
    var queryParams = event.params.querystring;
    
    if (queryParams.Test) {
        console.log("Returning test data.")
        returnTestData(done);
        return;
    }
    
    if(queryParams.zipcode) {
        exports.connect(() => {
            exports.getCoordinatesForZip(queryParams.zipcode, (err, res) => {
                if (err) {
                    callback(err);
                    return;
                }
                
                var lat = res.Coordinate.x;
                var long = res.Coordinate.y;
                exports.getZipcodeFromLocation({lat: lat, long: long}, (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    
                    const zips = res.map((z) => z.ZipCode);
                    exports.getZips(zips, (err, res) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        
                        var scores = res.map((z) => {
                            return {
                                'zip_code': z.Zip,
                                'score': z.Score};
                        });
                        
                        callback(null, {'scores': scores});
                    });
                });
            });
        });
        return;
    }
    
    callback('missing required parameter: zipcode');
};
