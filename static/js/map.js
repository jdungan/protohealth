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
    
    // .range(['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#0c2c84', '#ffffcc', '#c7e9b4'])

  // add legend
  var LegendControl = L.Control.extend({
      options: {
          position: 'topleft'
      },
      onAdd: function (map) {
          // create the control container with a particular class name
          legend= L.DomUtil.create('div', 'legend');
          return legend;
      },
  });

  map.addControl(new LegendControl());

 
//build axis
  function LegendAxis(key_domain){
    return;
    if (!LegendAxis.l) {
      
      LegendAxis.l =     d3.select(legend).append('svg')
      .attr('width',function () {return 500})
      .attr('height',function () {return 50})
      .append("g")
          .attr("class", "key")
          .attr("transform", "translate(20,20)");
      
      l.call(xAxis)
    
    }
    
    var x = d3.scale.linear()
        .domain(key_domain)
        .range([0,200]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
        .tickSize(10)


    // l.selectAll("rect")
    //     .data(quantize.range().map(function(color) {
    //       var d = quantize.invertExtent(color);
    //       if (d[0] == null) d[0] = x.domain()[0];
    //       if (d[1] == null) d[1] = x.domain()[1];
    //       return d;
    //     }))
    //   .enter().append("rect")
    //     .attr("height", 20)
    //     .attr("x", function(d) { 
    //       return x(d[0]); })
    //     .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    //     .style("fill", function(d) { return quantize(d[0]); });
  }
  
  function changeField() {
    var fName = this.options[this.selectedIndex].value;
    SGH.json({key:fName}).done(function (data) {
      quantize.domain([+data[0].key,+data[data.length-1].key]);
      LegendAxis(_.map(data,function(obj){ return +obj.key; }))
        
      _.each(data,function (obj) {
        _.each(obj.values,function (county_data) {
          key_value = +county_data[fName];
          d3.select('#F'+county_data.FIPS)
            .attr("class", function(d) { 
              return 'county '+ quantize( key_value); })
          
        })
      })
    });
  };
  

  var datasets;
  
  // get the list of datasets and build the control
  SGH.datasets().done(function (data) {

    d3.select(legend).selectAll('h3')
      .data(data)
      .enter()
      .append('h3')
      .text(function (d) {return d.name;})
      .append('select')
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