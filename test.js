var i = require('./index.js');

/*i.connect(() => {
    i.getCoordinatesForZip('27502', (err, res) => {
        var lat = res.Coordinate.x;
        var long = res.Coordinate.y;
        i.getZipcodeFromLocation({lat: lat, long: long}, (err, res) => {
            console.log('RES:', res);
        })
        
    });
});*/


i.handler({params: {querystring: {zipcode: '27502'}}}, {}, (err, res) => {console.log('RES:', res);});
