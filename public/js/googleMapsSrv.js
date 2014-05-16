'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('googleMapsSrv', [])

.service('googleMapsService',function() {
    
    var googleMaps = function(containerHtml) {
        
        var that = this;
        this.containerHTML = containerHtml;
        this.map; 
        this.currentPolygonCountry;
        this.countriesPath = {
            nicaragua : '12.908198,-87.813721,12.645698,-87.709351,12.640338,-87.39624,' + 
             '12.275599,-87.033691,11.942601,-86.737061,11.469258,-86.363525,11.18918,-85.946045,10.887254,' +                                                        '-85.814209,11.18918,-85.594482,10.898042,-84.924316,11.016689,' + 
             '-84.660645,10.714587,  -84.16626,10.682201,-83.551025,14.966013,-82.364502,15.029686,' + 
             '-83.188477,15.093339,-83.616943,14.753635,-84.506836,15.050906,-84.968262,' + 
             '14.317615,-85.473633,14.147229,-85.814209,14.125922,-86.506348,13.143678,-87.703857'
        }
        
    };
    
    googleMaps.prototype.addFeatureToGoogleMaps =  function(){
        google.maps.Polygon.prototype.isInside = function(point) {
        // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
        var crossings = 0,
            path = this.getPath();

        // for each edge
        for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

        }

     };
    };
    
    googleMaps.prototype.loadMap = function(customOptions,callbackMapReady) {
        var mapDefaultOptions = {
          center: new google.maps.LatLng(-25.363882,131.044922),
          zoom: 8
        };        
        
        var optionsMap;
        if(typeof customOptions !== 'undefined') {
            optionsMap = customOptions;
        } else {
            optionsMap = mapDefaultOptions;
        }        
        this.map = new google.maps.Map(this.containerHTML,optionsMap); 
        
        google.maps.event.addListener(this.map, 'idle', function() {
            if(typeof callbackMapReady !== 'undefined') {
                callbackMapReady();
            }
        });
    };
    
    googleMaps.prototype.createMarker = function(data) {
        var tweetInside = [];        
        for (var i = 0; i < data.length; i++) {            
            var position = new google.maps.LatLng(data[i].lat,data[i].lng);
            
           if(this.currentPolygonCountry.isInside(position)) {
                    var marker = new google.maps.Marker({
                    position: position,
                    map: this.map,
                    title: data[i].user.name
                });
                data[i].marker = marker;  
                tweetInside.push(data[i]);                
                console.log(data[i].text.match(/#\S+/g));
            }
            
        };        
        return tweetInside;
    };
    
    googleMaps.prototype.removeMarker = function(data) {      
        for (var i = 0; i < data.length; i++) {           
           data[i].marker.setMap(null);            
        };        
    };
    
    googleMaps.prototype.createPolygonCountries = function() {
        var arrayPath = this.stringToArrayMVC (this.countriesPath.nicaragua);
        this.currentPolygonCountry = new google.maps.Polygon({
            paths: arrayPath,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
        });	
        
    }
    
    googleMaps.prototype.stringToArrayMVC = function (pathString) {
        var pathArray = pathString.split(",");
        var numberPoints = pathArray.length;
        var path = new google.maps.MVCArray();

        for(var k = 0; k < numberPoints;k=k+2){			
            path.push (new google.maps.LatLng(pathArray[k],pathArray[k+1]));				
        }
        return path;
    }
    
    return googleMaps;
})
  
.value('version', '0.1');