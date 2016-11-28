require 'csv'
require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)

mysql_client = Mysql2::Client.new(:host => "awsreinventteam46-cluster-1.cluster-c8x1imogzrzr.us-west-2.rds.amazonaws.com",
                                  :username => "aws2016",
                                  :password => ENV['MYSQL_PASSWORD'],
                                  :database => 'Aws2016Team46DB')

records = []

CSV.foreach("zipcodes.csv") do |row|
  zip = row[1]
  lon = row[2]
  lat = row[3]
  city = row[4]
  state = row[5]

  records << %Q{("#{zip}", POINT(#{lon}, #{lat}), "#{city}", "#{state}")}

end

query = %Q{INSERT INTO ZipCodes (ZipCode, Coordinate, City, State) VALUES#{records.join(',')}}
puts query
mysql_client.query(query)
