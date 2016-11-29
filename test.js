var i = require('./index.js');

var done = (err, res) => {
    console.log('RES:', res);
}

/*i.connect(() => {
    i.getCoordinatesForZip('27502', (err, res) => {
        var lat = res.Coordinate.x;
        var long = res.Coordinate.y;
        i.getZipcodeFromLocation({lat: lat, long: long}, (err, res) => {
            const zips = res.map((z) => z.ZipCode);
            i.getZips(zips, done);
        })
        
    });
});*/


i.handler({params: {querystring: {zipcode: '27502'}}}, {}, done);

/*i.connect(() => {
    i.getZips(['27502', '46038'], done);        
})*/
