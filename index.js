'use strict';

var mysql = require('mysql');
var _ = require('lodash');

console.log('Loading function');

var conn;

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

exports.getZipcodeFromLocation = function(coord, radius, limit, callback) {
    console.log('Querying....', coord);
    var lat = coord.lat; 
    var long =  coord.long;
    const dist = _.toNumber(radius) || 10;
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
    
    var query = 'select ZipCode, Coordinate from ZipCodes where st_within(Coordinate, envelope(linestring(point(?, ?), point(?, ?)))) order by st_distance(point(?, ?), Coordinate)';
    if (limit) {
        query = query + " limit " + limit;
    }
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

exports.getZips = function(zips, limit, callback) {
    console.log("ZIPS:", zips);
    var z = zips.map((z) => "'" + z + "'").join(' , ');
    var query = "SELECT * FROM ZipAndScore WHERE Zip IN(" + z + ") ORDER BY Score DESC ";
    if (limit) {
        query = query + " LIMIT " + limit;
    }
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


exports.queryScoresForCoordinates = function(coords, radius, limit, callback) {
    console.log('COORDINATES:', coords);
    exports.getZipcodeFromLocation(coords, radius, limit, (err, res) => {
        if (err) {
            callback(err);
            return;
        }
        
        var getCoordinates = function(zip) {
            var zipObj = _.find(res, (z) => z.ZipCode == zip);
            return {
                    'lat': zipObj.Coordinate.y,
                    'lon': zipObj.Coordinate.x
                }
        };
        
        const zips = res.map((z) => z.ZipCode);
        exports.getZips(zips, limit, (err, res) => {
            if (err) {
                callback(err);
                return;
            }
            
        
            var scores = res.map((z) => {
                return {
                    'zip_code': z.Zip,
                    'score': z.Score,
                    'coordinates': getCoordinates(z.Zip)};
            });
            
            for (let j = 0; j < scores.length; j++) {
                scores[j].rank = j + 1;
            }
            
            callback(null, {'scores': scores});
        });
    });
} 
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
                
                var lat = res.Coordinate.y;
                var long = res.Coordinate.x;
                exports.queryScoresForCoordinates({lat: lat, long: long}, 10, 10, callback);
            });
        });
        return;
    }
    
    if (queryParams.Lat && queryParams.Long) {
        exports.connect(() => {
            const lat = _.toNumber(queryParams.Lat);
            const long = _.toNumber(queryParams.Long);    
            const radius = 1 / _.toNumber(queryParams.Zoom || "10") * 100;
            exports.queryScoresForCoordinates({lat: lat, long: long}, radius, null, callback);
        })
        return;
    }
    
    callback('missing required parameter: zipcode or lat and lon');
};
