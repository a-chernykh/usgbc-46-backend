'use strict';

//var mysql = require('mysql');

console.log('Loading function test final');

var conn;

/*var query = function(callback) {
    if (!conn) {
        conn = mysql.createConnection({
            host     : 'awsreinventteam46-us-west-2a.c8x1imogzrzr.us-west-2.rds.amazonaws.com',
            user     : 'aws2016',
            password : 'aws201646',
            port     : '3306'
        });    
    
        console.log('Connecting to mysql...');
        conn.connect();
        console.log('Connected');
    }
    
    console.log('Querying....');
    conn.query('SELECT * FROM TABLE', function(err, rows, fields) {
        
        if (err) {
            console.log('Query error:', err);
            callback(err);
            return;
        }
        
        console.log('Query Result:', rows);
        callback(rows);
    })
}*/

var dbname = 'aws2016team46db';

var getZipcodeFromLocation = function(location) {
    
}

var returnTestData = function(callback) {
    var res = {
        scores: [
            {
                zip_code: '22222',
                score: '35'
                
            },
            {
                zip_code: '11111',
                score: '23'
                
            }
        ]
    }
    
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

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    var res = {
        leaders: [
            {
                zipcode: '22222',
                leedScore: '35'
                
            },
            {
                zipcode: '11111',
                leedScore: '23'
                
            }
        ]
    }
    
    if (event.test) {
        returnTestData(callback);
        return;
    }
    
    callback(null, res);
    
    //query(callback);
    
    
    /*switch (event.httpMethod) {
        case 'GET':
            dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }*/
};
