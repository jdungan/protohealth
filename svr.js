var express = require("express"),
  	fs      = require('fs'),
    d3      = require('d3')
    csv     = require('csv'),
    async   = require('async-chained'),  
    _       = require('underscore');    
    

//LOAD THE DATA

var health_data={};

//FIPS,Population,Deaths,% Fair/Poor,% LBW,% Smokers,% Obese,"STD Rates per 100,000",Teen Birth Rate,Mammography Rate,% Unemployed,% Children in Poverty,Violent Crime Rate,Ozone Days,% Limited Access Food,% Fast Foods

var build_data = function(input_file){
  fs.readFile(input_file, 'utf8', function (err, data) {
    
    health_data = d3.csv.parse(data);
            
  });   
};

var run_server = function(){
  // RUN THE SERVER  
  app = express();

  app.use(express.static(__dirname + '/static'));

  app.use(express.logger());

  app.use(function(request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    next();
  });

  app.get('/json', function(request, response) {

    var key = request.query.key || 'FIPS'

    var reponse_data = d3.nest()
        .key(function(d) { return d[key]; }) 
        .entries(health_data);  
          
          
      response.json(reponse_data)

  });

  app.get('/', function(request, response) {

      response.sendfile('index.html')

  });

  var port = process.env.PORT || 1984;


  app.listen(port, function() {
    console.log("Listening on " + port);
  });
  
  
}


async.chain()
  .first(
    build_data('static/data/Protohealth.csv')
  )
  .then(
    run_server()
  );


// $ node --debug-brk counties.js
// $ node-inspector &
// http://127.0.0.1:1984/debug?port=5858 