var express = require("express"),
  	fs      = require('fs'),
    d3      = require('d3')
    csv     = require('csv'),
    async   = require('async-chained'),  
    _       = require('underscore');
    
    
//LOAD THE DATA

var health_data;

var build_data = function(input_file,sort_object){
  fs.readFile(input_file, 'utf8', function (err, data) {
    sort_object = d3.csv.parse(data);
    var nest = d3.nest()
        .key(function(d) { return new Date(d.DCLN_INCIDENT_BGN_DT).getFullYear(); })
        .key(function(d) { return d.DCLN_INCIDENT_BGN_DT; })
        .entries(bycounty);
    
  });   
};

async.chain()
  .first(
  //            make_st_codes('state.codes.csv')
  )
  .then(
//  make_fips('US_FIPS_Codes.csv')
  )
  .then(
  // output_file('data.gov.short.csv', 'disasters.array')

    build_data('data/Protohealth.csv',health_data)
  );



// RUN THE SERVER  
app = express();

app.use(express.logger());

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  next();
});


app.get('/find', function(request, response) {
	var find_text = request.query.text || '';
	    if (err){
			// console.log(err.message)
	    	response.write(err.message);
			response.end();
	    }
		else{
			// console.log(reply)
			response.json(reply)
		}
	});
});

var port = process.env.PORT || 1984;


app.listen(port, function() {
  console.log("Listening on " + port);
});

