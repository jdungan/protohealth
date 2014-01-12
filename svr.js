var express = require("express"),
  	fs      = require('fs'),
    d3      = require('d3')
    csv     = require('csv'),
    async   = require('async-chained'),  
    _       = require('underscore');    
    

//LOAD THE DATA

var datasets=[];

var build_data = function(file_name){

  console.log('Loadindg ... static/data/' + file_name + '.csv')

  var this_set = {};
  
  this_set.name = file_name
  
  fs.readFile('static/data/' + file_name + '.csv', 'utf8', function (err, data) {
      
    this_set.data = d3.csv.parse(data);
    
    this_set.fields = _.keys(this_set.data[0]);

    datasets.push(this_set);
  
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

  app.get('/json/datasets', function(request, response) {
    var response_array =[];
                  
    _.each(datasets,function (value, key, list) {
      var obj={}
      obj.name = value.name;
      obj.fields = value.fields;
      response_array.push(obj)
    })                
    response.json(response_array)

  });


  app.get('/json', function(request, response) {

    var key = request.query.key || 'FIPS',
        name = request.query.name || "";

        requested_set = _.find(datasets,function (dataset) {
          return dataset.name === name;
        })  || {};
        
    var reponse_data = d3.nest()
        .key(function(d) { return d[key]; }) 
        .entries(requested_set.data);  
                    
    response.json(_.sortBy(reponse_data,function (obj) {
      return +obj.key;
    }))

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
    build_data('2013 County Health Ranking Oklahoma Data - v1_0')
  )
  .then( 
    build_data('Oklahoma Medicare Reimbursements 2010')
  )
  .then(
    build_data('2010 Medicare Outcomes Data Oklahoma')  
  )
  .then(
    run_server()
  );


// $ node --debug-brk counties.js
// $ node-inspector &
// http://127.0.0.1:1984/debug?port=5858 