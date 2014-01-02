


jQuery(document).ready(function () {

    var map = L.mapbox.map('map', 'jdungan.g8c274d0', {zoomControl: false}).setView([39, -96], 5),
    svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
    legend,
    counties, 
    legend_element;
    



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


     
    queue()
        .defer(draw_counties,'/data/counties.json')
        .await();
    
});// end document ready

