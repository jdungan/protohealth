jQuery(document).ready(function () {


  //https://a.tiles.mapbox.com/v3/jdungan.gnm8110k/page.html?secure=1#8/35.929/-97.130
  
    var map = L.mapbox.map('map', 'jdungan.gnm8110k', {zoomControl: false}).setView([35.929, -97.130], 7),
    svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
    legend,
    counties, 
    legend_element;

    SGH = new healthdata()
    
    function draw_counties(url,callback) {
        d3.json(url, function(collection) {

            // Use Leaflet to implement a D3 geometric transformation.
            function projectPoint(x, y) {
                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            };

            var transform = d3.geo.transform({
                point: projectPoint
            });
            
            var path = d3.geo.path().projection(transform)

            bounds = path.bounds(collection);

            // Reposition the SVG to cover the features.
            function reset() {
                var topLeft = bounds[0],
                    bottomRight = bounds[1];

                svg.attr("width", bottomRight[0] - topLeft[0])
                    .attr("height", bottomRight[1] - topLeft[1])
                    .style("left", topLeft[0] + "px")
                    .style("top", topLeft[1] + "px");
                g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
                counties.attr("d", path);
            };

            counties = g.selectAll("path")
                .data(collection.features)
                .on('mouseover',show_county_details)
                .enter()
                .append("path")
                .attr('class', 'county')
                .attr('id', function(d) {return 'F' + d.properties.FIPS;});
                
            map.on("viewreset", reset);
            reset();
            callback()
        });
    };
    
    
  var quantize = d3.scale.quantize()
    .domain([0,100])
    .range(d3.range(9).map(function(i) { return "q" + i ; }));
    // colors=.range(['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84', '#ffffcc', '#c7e9b4'])

  // add legend
  var LegendControl = L.Control.extend({
      options: {
          position: 'bottomright'
      },
      onAdd: function (map) {
          // create the control container with a particular class name
          legend= L.DomUtil.create('div', 'legend');
          return legend;
      },
  });
  
  map.addControl(new LegendControl());

  // add county
  var countyControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },
      onAdd: function (map) {
          // create the control container with a particular class name
          county_detail= L.DomUtil.create('div', 'county_detail');
          return county_detail;
      },
  });
  
  map.addControl(new countyControl());

 
 
  function show_county_details(){
    
    details = d3.select('#county_details')
    details.text('')
    details
      .text(this.datum())
    
  };
  
  
//build axis
  function buildLegend(data){
    var thisf = buildLegend;
            
    var x = thisf.x = thisf.x || d3.scale.linear()
        .range([0,300]);

    var xAxis = thisf.xAxis = thisf.xAxis || d3.svg.axis()
        .orient("bottom")
        .tickSize(30)
        .tickFormat(d3.format('s'))

    var l = thisf.l  = thisf.l || d3.select(legend).append('svg')
        .attr('width',function () {return 400})
        .attr('height',function () {return 50})
        .append("g")
            .attr("class", "key")
            .attr("transform", "translate(50,5)");
    
    x
      .domain(quantize.domain())
      .ticks(quantize.range().length)
    
    xAxis.scale(x)
    l.call(xAxis)
            
    colors  = l.selectAll("rect")
      .data(function () {return quantize.range(); })
          
    colors.exit().remove();
    
    colors.enter().append("rect")
    
    color_width = x.range()[1]/quantize.range().length
    
    colors
      .attr("height", 20)
      .attr("x", function(d,i) { return i*color_width; })
      .attr('width',function (d,i) {return color_width})
      .attr('y',function () {return 0})
      .attr("class", function(d,i) { return 'q'+i; })


  }
  
  function changeField() {
    var fName = this.options[this.selectedIndex].value,
        dsName = d3.select(this.parentNode).datum().name;
    
    SGH.json({key:fName,name:dsName}).done(function (data) {
      
      quantize.domain(d3.extent(data,function(obj){ return +obj.key; }));
      buildLegend(data)
        
      _.each(data,function (obj) {
        _.each(obj.values,function (county) {
          key_value = +county[fName];
          d3.select('#F'+county.FIPS)
            .attr("class", function(d) { 
              return 'county '+ quantize( key_value); })
          
        })
      })
    });
  };
  

  // get the list of datasets and build the control
  SGH.datasets().done(function (data) {

    d3.select('#legend_form').selectAll('h3')
      .data(data)
      .enter()
      .append('h3')
        .text(function (d) {return d.name;})
      .append('select')
        .data(data)
        .on('change',changeField)
        .selectAll('option')
          .data(function (d) {return d.fields||[];})          
          .enter()
          .append('option')
            .attr('value',function (d) {return d})
            .text(function (d) {return d})
  
  });
  

  queue()
      .defer(draw_counties,'/data/counties.json')
    
});// end document ready