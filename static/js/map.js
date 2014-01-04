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
    
    
    function changeField() {
      var fName = this.options[this.selectedIndex].value;
      SGH.json({key:fName}).done(function (data) {
        var quantize = d3.scale.quantize()
          .domain([+data[0].key,+data[data.length-1].key])
          .range(d3.range(9).map(function(i) { return "q" + i ; }));        

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
    
    var LegendControl = L.Control.extend({
        options: {
            position: 'topleft'
        },
        onAdd: function (map) {
            // create the control container with a particular class name
            legend_element= L.DomUtil.create('div', 'datatsets');
            return legend_element;
        },
    });

    map.addControl(new LegendControl());

    var datasets;
    
    // get the list of datasets and build the control
    SGH.datasets().done(function (data) {

      d3.select(legend_element).selectAll('h3')
        .data(data)
        .enter()
        .append('h3')
        .text(function (d) {
          return d.name;})
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