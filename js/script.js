//Roughly the center of Missouri(lat/long)
var center = [38.6321346, -92.4013551]

//Target the chart div as the container for our leaflet map
//Set the center point and zoom level.
var map = L.map('chart').setView(center, 7);

// add an OpenStreetMap tile layer
//OpenStreetMap is an open source map layers anyone can use free of charge.
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// //Add an svg element to the map.
var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

//This will be a dictionary object we use to lookup the info for each county.
//It's empty for now. We add our data when we load or json.
var theData = {};

// Use Leaflet to implement a D3 geometric transformation.
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

//http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};


var allZipCodes = {};
var ourZipsArray = [];

$(document).ready(function(d) {

  d3.csv("data/guns.csv", function(data) {
  for (i=0; i<data.length; i++) {
    if (!allZipCodes[data[i].zipcode]) {
      allZipCodes[data[i].zipcode] = 0;
      allZipCodes[data[i].zipcode] +=1;
    }
  }

    $.each(allZipCodes, function(zip, count) {
      var zip = String(zip);
      var zip = zip.substring(0,5);
      var obj = {
        zip :zip,
        count : count
      }

      ourZipsArray.push(obj);
      console.log(ourZipsArray);
    });


$.each(data, function(i, item) {
  var location = item["City"]+item["zipcode"];
  theData[location] = item;
})

  drawMap();

  function drawMap() {
    d3.json("js/missouri-zips.json", function(collection) {
      var transform = d3.geo.transform({
        point: projectPoint
      }),
      path = d3.geo.path().projection(transform);
      console.log(collection);


  var feature = g.selectAll("path")
    .data(collection.features)
    .enter()
    .append("path")
    .attr("class", "zipcode");


  feature.style("fill", function(d) {
    var zips = d.properties.zcta5ce10;
    var gunLicenses = theData[zips]["zipcode"];

    gunLicenses = Number(gunLicenses);

    if (gunLicenses = 0) {
        return "#ffffb2";
    } else if (gunLicenses > 0 && gunLicenses <= 10) {
        return "#fecc5c";
    } else if (gunLicenses > 10 && gunLicenses <= 20) {
        return "#fd8d3c";
    } else if (gunLicenses > 20) {
        return "#e31a1c";
    }

    })

  map.on("viewreset", function() {
    reset();

  reset();

function reset() {
  var bounds = path.bounds(collection),
    topLeft = bounds[0],
    bottomRight = bounds[1];

  svg.attr("width", bottomRight[0] - topLeft[0])
    .attr("height", bottomRight[1] - topLeft[1])
    .style("left", topLeft[0] + "px")
    .style("top", topLeft[1] + "px");

  g.attr("transform", "translate(" + -topLeft[0] + -topLeft[1] + ")");

  feature.attr("d", path);
}
});
  })
  }

});
});
