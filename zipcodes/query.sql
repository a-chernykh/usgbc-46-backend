set @lat= -121.705327;
set @lon = 37.189396;
set @dist = 10;
set @rlon1 = @lon-@dist/abs(cos(radians(@lat))*69);
set @rlon2 = @lon+@dist/abs(cos(radians(@lat))*69);
set @rlat1 = @lat-(@dist/69);
set @rlat2 = @lat+(@dist/69);

select ZipCode from ZipCodes
where st_within(Coordinate, envelope(linestring(point(@rlon1, @rlat1), point(@rlon2, @rlat2))))
order by st_distance(point(@lon, @lat), Coordinate) limit 10;

ALTER TABLE ZipCodes ADD SPATIAL INDEX(Coordinate);


set @code = '12345';

select Coordinate from ZipCodes
where Code = @code
