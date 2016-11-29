var i = require('./index.js');

var done = (err, res) => {
    console.log('RES:', res);
}

function test() {
    i.connect(() => {
        i.getCoordinatesForZip('27502', (err, res) => {
            var lat = res.Coordinate.y;
            var long = res.Coordinate.x;
            i.getZipcodeFromLocation({lat: lat, long: long}, (err, res) => {
                
                //const zips = res.map((z) => z.ZipCode);
                done(err, res);
                //i.getZips(zips, done);
            })
            
        });
    });
};


i.handler({params: {querystring: {zipcode: '27502'}}}, {}, done);

/*i.connect(() => {
    i.getZips(['27502', '46038'], done);        
})*/
