angular.module('leafletApp').service('fweMapService',['$http','$rootScope','incidentService','messageService','configService',function($http, $rootScope, incidentService, messageService,configService){
    var pushpinIcon =  L.icon({
        iconUrl: 'images/pin-red.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });
    var fweMapService = {
        data: {
            map: L.map('mymapdiv',{zoomControl:false,attributionControl:false}),
            initialView: {north: -9.5, south: -44.5, west: 111.0, east: 156.0},
            pushpinMarker: new L.marker([70,0],{icon: pushpinIcon}),
            crossHair: false,
            valueAtClick: 1,
            topo: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"),
            osm: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
            aerial: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
            fireWeatherAreas: L.shapefile("shapefiles/FireWeatherArea.zip",options={fill:false,color:'#fff',opacity:1,weight:2}),
            DTZs: L.shapefile("shapefiles/DTZ.zip",options={fill:false,color:'#000',opacity:1,weight:2}),
            overlays: {},
            baselayers: {},
            forecastLayers: {},
            creationTimes: {},
            displayedTimeStep: 0,
        },
        addIncidents: function () {
            incidentService.getNSW().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });
            
            incidentService.getACT().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });

            incidentService.getVIC().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });

            incidentService.getSA().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });

            incidentService.getNT().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });

            incidentService.getWA().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });

            incidentService.getTAS().addTo(fweMapService.data.incidents);
            
            incidentService.getQLD().then(function(incidents) {
                incidents.addTo(fweMapService.data.incidents);
            });
        },
        invalidateMap: function () {
            fweMapService.data.map.invalidateSize();
        },
        initialiseEventHandlers: function () {
            fweMapService.data.map.on('baselayerchange', function (e) {
                fweMapService.data.activeLayerName = e.name;
            });
            
            fweMapService.data.map.on('click', function(e) { 
                fweMapService.data.pushpinMarker.setLatLng(e.latlng);
                //Use apply here because Angular doesn't notice the Leaflet click event
                //  because I'm not using the leaflet-directive
                //  because the directive doesn't zoom properly with geotiffs
                $rootScope.$apply(function() {
                    fweMapService.data.valueAtClick = fweMapService.getLayerValue(e);
                });
            });
        },
       initialiseMapLayers: function () {
            //Create a layergroup to hold incident data
            fweMapService.data.incidents = L.layerGroup().addTo(fweMapService.data.map);
            fweMapService.addIncidents();
            
            //Create layer groups to hold state forecasts and register them with the map layer control
            for (var i=0;i<configService.data.states.length;i++) {
                fweMapService.data.forecastLayers[configService.data.states[i]] = L.layerGroup();
                fweMapService.data.overlays[configService.data.states[i]] = fweMapService.data.forecastLayers[configService.data.states[i]];
                
            }
        
            //Add layers to map
            fweMapService.data.map.options.minZoom=5;
            fweMapService.data.map.options.maxZoom=14;
            fweMapService.data.map.addLayer(fweMapService.data.topo);
            fweMapService.data.activeLayerName = 'Topography';
            fweMapService.data.map.addLayer(fweMapService.data.fireWeatherAreas);
            fweMapService.data.map.addLayer(fweMapService.data.DTZs);
            fweMapService.data.pushpinMarker.addTo(fweMapService.data.map);
            for (var i=0;i<configService.data.states.length;i++) {
                fweMapService.data.map.addLayer(fweMapService.data.forecastLayers[configService.data.states[i]]);
            }
            
            //Register layers with map control
            fweMapService.data.baselayers["Topography"] = fweMapService.data.topo;
            fweMapService.data.baselayers["Street maps"] = fweMapService.data.osm;
            fweMapService.data.baselayers["Aerial images"] = fweMapService.data.aerial;
            fweMapService.data.overlays["Fire weather areas"] = fweMapService.data.fireWeatherAreas;
            fweMapService.data.overlays["RFS DTZs"] = fweMapService.data.DTZs;
            fweMapService.data.overlays["Incidents"] = fweMapService.data.incidents;

            //Add controls
            L.control.layers(fweMapService.data.baselayers,fweMapService.data.overlays).addTo(fweMapService.data.map);
            L.control.zoom({position: "topright"}).addTo(fweMapService.data.map);
            L.control.scale({
                position: "bottomright",
                imperial: false
            }).addTo(fweMapService.data.map);
            L.control.mousePosition({
                position:'bottomright',
                numDigits:4
            }).addTo(fweMapService.data.map);            
    
        },
        loadForecastLayer: function(variableIndex, requestedTimeStep, showWindBarbs, Opacity) {
            fweMapService.data.valueAtClick = undefined;
            fweMapService.data.displayedLayerIndex = variableIndex;
            
            var metadataFileName = 'metadata/'+configService.data.forecastLayers[variableIndex].variable+'.json'
            $http.get(metadataFileName)
                .then(function successCallback(response) {
                    //Populate creationTimeString object
                    for (var i=0;i<configService.data.states.length;i++) {
                        var state = configService.data.states[i];
                        fweMapService.data.creationTimes[state] = new Date(parseInt(response.data.creationTimes[state])*1000);
                    }
                    
                    fweMapService.data.availableDates = [];
                    fweMapService.data.dateIndices = {};
                    fweMapService.data.dateLiterals = {};
                    fweMapService.data.dateIntegers = {};

                    //Build a list of unique dates
                    for (var i=0;i<configService.data.states.length;i++) {
                        var state = configService.data.states[i];
                        fweMapService.data.dateLiterals[state] = response.data.timeSteps[state];
                        fweMapService.data.dateIntegers[state] = [];
                        for (var j=0;j<(response.data.timeSteps[state]||[]).length;j++) {
                            if (configService.data.forecastLayers[variableIndex].daily) {
                                var year = parseInt(response.data.timeSteps[state][j].slice(0,4));
                                var month = parseInt(response.data.timeSteps[state][j].slice(4,6))-1;
                                var day = parseInt(response.data.timeSteps[state][j].slice(6,8));
                                var hour = 0;
                                var minute = 0;
                                var nextDate = new Date(Date.UTC(year,month,day,hour,minute))
                                nextDate = nextDate.setDate(nextDate.getDate() + 1); //Make sure 23:59 gets converted to the correct day, deal with daylight savings etc
                            } else {
                                var year = parseInt(response.data.timeSteps[state][j].slice(0,4));
                                var month = parseInt(response.data.timeSteps[state][j].slice(4,6))-1;
                                var day = parseInt(response.data.timeSteps[state][j].slice(6,8));
                                var hour = parseInt(response.data.timeSteps[state][j].slice(9,11));
                                var minute = parseInt(response.data.timeSteps[state][j].slice(11,13));
                                console.log(hour,minute);
                                var nextDate = new Date(Date.UTC(year,month,day,hour,minute)).getTime();  
                            }
                            // if ((new Date() - nextDate)<24*3600*1000) {
                                fweMapService.data.dateIntegers[state].push(nextDate);
                                if (fweMapService.data.availableDates.indexOf(nextDate)==-1) {
                                    // console.log(state, response.data.timeSteps[state][j]);
                                    fweMapService.data.availableDates.push(nextDate);
                                } 
                            // } else {
                                // fweMapService.data.dateLiterals[state].splice(0,1);
                            // }
                        }
                    }
                    fweMapService.data.availableDates.sort();
                    fweMapService.data.maxTimeStep = fweMapService.data.availableDates.length-1;
                    
                    //Now construct look-up indices for each state
                    for (var i=0;i<configService.data.states.length;i++) {
                        var state = configService.data.states[i];
                        fweMapService.data.dateIndices[state] = [];
                        for (var j=0;j<fweMapService.data.availableDates.length;j++) {
                            fweMapService.data.dateIndices[state].push(fweMapService.data.dateIntegers[state].indexOf(fweMapService.data.availableDates[j]));
                        }
                    }
                    console.log(fweMapService.data.availableDates);
                    console.log(fweMapService.data.dateLiterals);
                    // console.log(fweMapService.data.dateIndices);
                    messageService.sendMessage('layers','loaded');
                    fweMapService.InitialiseLayer(requestedTimeStep, showWindBarbs, Opacity);

                }, function errorCallback(response) {
                    console.log('failed to get layer metadata');
                });    
        },
        calculateTimeStep: function(requestedTimeStep) {
            return fweMapService.data.availableDates[requestedTimeStep];
        },
        InitialiseLayer: function(requestedTimeStep, showWindBarbs, opacity) {
            fweMapService.data.valueAtClick = undefined;
            fweMapService.data.displayedTimeStep = requestedTimeStep;
            fweMapService.data.displayedTimeStamp = fweMapService.data.availableDates[fweMapService.data.displayedTimeStep];
            console.log(fweMapService.data.displayedTimeStamp, new Date(fweMapService.data.displayedTimeStamp));
            
            var variableIndex = fweMapService.data.displayedLayerIndex;
            
            var colorScaleName = configService.data.forecastLayers[variableIndex].layerOptions.colorScale;
            fweMapService.data.displayMin = configService.data.forecastLayers[variableIndex].layerOptions.displayMin;
            fweMapService.data.displayMax = configService.data.forecastLayers[variableIndex].layerOptions.displayMax;
            var plot = new plotty.plot({
                data: [0],
                width: 1, height: 1,
                domain: [fweMapService.data.displayMin, fweMapService.data.displayMax], 
                colorScale: colorScaleName,
            });
            fweMapService.data.colorScaleDataURL = plot.colorScaleCanvas.toDataURL();            
            
            for (var i=0;i<configService.data.states.length;i++) {
                var state = configService.data.states[i];
                fweMapService.data.forecastLayers[state].clearLayers();
                var stateIndex = fweMapService.data.dateIndices[state][fweMapService.data.displayedTimeStep];
                if (fweMapService.data.dateLiterals[state]) {
                    console.log(state,fweMapService.data.dateLiterals[state][stateIndex]);

                    var layerFile = 'tif'+'/'+state+'/'+configService.data.forecastLayers[variableIndex].variable+'/'+fweMapService.data.dateLiterals[state][stateIndex]+'.tif';
                    var layerOptions = configService.data.forecastLayers[variableIndex].layerOptions;
                    layerOptions.clip = configService.data.boundaryPolygons[state];
                    var forecastLayer = L.leafletGeotiff(layerFile,layerOptions);
                    fweMapService.data.forecastLayers[state].addLayer(forecastLayer);
                    forecastLayer.setOpacity(opacity);
                    
                    if (configService.data.forecastLayers[variableIndex].windDir) {
                        var layerFile = 'tif'+'/'+state+'/'+configService.data.forecastLayers[variableIndex].windDir+'/'+fweMapService.data.dateLiterals[state][stateIndex]+'.tif';
                        var layerOptions = {band: 0,vector:true};
                        layerOptions.clip = configService.data.boundaryPolygons[state];
                        var forecastLayerWindDir = L.leafletGeotiff(layerFile,layerOptions);
                        fweMapService.data.forecastLayers[state].addLayer(forecastLayerWindDir);
                        if ((showWindBarbs) && (configService.data.forecastLayers[variableIndex].windDir)) {
                            forecastLayerWindDir.setOpacity(opacity);
                        } else {
                            forecastLayerWindDir.setOpacity(0);
                        }
                    }
                }
            }
        },
        setTimeStep(requestedTimeStep, showWindBarbs, opacity) {
            fweMapService.data.valueAtClick = undefined;
            fweMapService.data.displayedTimeStep = requestedTimeStep;
            fweMapService.data.displayedTimeStamp = fweMapService.data.availableDates[fweMapService.data.displayedTimeStep];
            
            var variableIndex = fweMapService.data.displayedLayerIndex;
            
            for (var i=0;i<configService.data.states.length;i++) {
                var state = configService.data.states[i];
                if (fweMapService.data.displayedTimeStep<=fweMapService.data.dateIndices[state].length) {
                    var stateIndex = fweMapService.data.dateIndices[state][fweMapService.data.displayedTimeStep];
                    if (stateIndex>=0) {
                        var layerFile = 'tif'+'/'+state+'/'+configService.data.forecastLayers[variableIndex].variable+'/'+fweMapService.data.dateLiterals[state][stateIndex]+'.tif';
                        console.log(layerFile);
                        fweMapService.data.forecastLayers[state].getLayers()[0].setURL(layerFile);
                        fweMapService.data.forecastLayers[state].getLayers()[0].setOpacity(opacity)

                        if (configService.data.forecastLayers[variableIndex].windDir) {
                            var layerFile = 'tif'+'/'+state+'/'+configService.data.forecastLayers[variableIndex].windDir+'/'+fweMapService.data.dateLiterals[state][stateIndex]+'.tif';
                            fweMapService.data.forecastLayers[state].getLayers()[1].setURL(layerFile);
                            if ((showWindBarbs) && (configService.data.forecastLayers[variableIndex].windDir)) {
                                fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(opacity);
                            } else {
                                fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(0);
                            }
                        }
                        
                    } else {
                        if (fweMapService.data.forecastLayers[state].getLayers().length>0) {
                            fweMapService.data.forecastLayers[state].getLayers()[0].setOpacity(0);
                        }
                        if ((showWindBarbs) && (configService.data.forecastLayers[variableIndex].windDir)) {
                            if (fweMapService.data.forecastLayers[state].getLayers().length>0) {
                                fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(0);
                            }
                        }
                    }
                } else {
                    fweMapService.data.forecastLayers[state].getLayers()[0].setOpacity(0);
                    if ((showWindBarbs) && (configService.data.forecastLayers[variableIndex].windDir)) {
                        fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(0);
                        }
                }
            }
            
        },
        setOpacity(opacity) {
            var variableIndex = fweMapService.data.displayedLayerIndex;
            
            for (var i=0;i<configService.data.states.length;i++) {
                var state = configService.data.states[i];
                if (fweMapService.data.displayedTimeStep<=fweMapService.data.dateIndices[state].length) {
                    var stateIndex = fweMapService.data.dateIndices[state][fweMapService.data.displayedTimeStep];
                    if (stateIndex>=0) {
                        fweMapService.data.forecastLayers[state].getLayers()[0].setOpacity(opacity)
                        // if (configService.data.forecastLayers[variableIndex].windDir) {
                            // if ((showWindBarbs) && (configService.data.forecastLayers[variableIndex].windDir)) {
                                // fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(opacity);
                            // } else {
                                // fweMapService.data.forecastLayers[state].getLayers()[1].setOpacity(0);
                            // }
                        // }
                    } 
                } 
            }
        },
        getLayerValue: function(e) {
            var isLeft = function(P0, P1, P2) {
                return ( (P1[1] - P0[1]) * (P2[0] - P0[0]) - (P2[1] -  P0[1]) * (P1[0] - P0[0]) );
            }
            var wn_PnPoly = function(P, V) {
                var wn = 0;    // the  winding number counter

                // loop through all edges of the polygon
                for (var i=0; i<(V.length-1); i++) {   // edge from V[i] to  V[i+1]
                    if (V[i][0] <= P[0]) {          // start y <= P.y
                        if (V[i+1][0]  > P[0])      // an upward crossing
                             if (isLeft(V[i], V[i+1], P) > 0)  // P left of  edge
                                 wn++;            // have  a valid up intersect
                    }
                    else {                        // start y > P.y (no test needed)
                        if (V[i+1][0]  <= P[0])     // a downward crossing
                             if (isLeft( V[i], V[i+1], P) < 0)  // P right of  edge
                                 wn--;            // have  a valid down intersect
                    }
                }
                return wn;
            }            
            //Determine state from lat long
            for (var i=0;i<configService.data.states.length;i++) {
                var state = configService.data.states[i];
                if (wn_PnPoly([e.latlng.lat,e.latlng.lng],configService.data.boundaryPolygons[state])<0) {
                    console.log('Point is in '+state,' ',fweMapService.data.forecastLayers[state].getLayers()[0].getValueAtLatLng(e.latlng.lat,e.latlng.lng));
                    return fweMapService.data.forecastLayers[state].getLayers()[0].getValueAtLatLng(e.latlng.lat,e.latlng.lng);
                }
            }
            return undefined;
        },
        zoomToInitialExtent: function() {
            var southWest = [fweMapService.data.initialView.south, fweMapService.data.initialView.west];
            var northEast = [fweMapService.data.initialView.north, fweMapService.data.initialView.east];
            var bounds = L.latLngBounds(southWest, northEast);
            //This is a workaround for a race condition in Leaflet.  Can be removed if fixed in a future version.
            setTimeout(function () {
                console.log("fit map");
                fweMapService.data.map.fitBounds(bounds);
                fweMapService.data.map.invalidateSize();
            }, 100);
        },
    }

    
    fweMapService.initialiseMapLayers();
    fweMapService.zoomToInitialExtent();
    fweMapService.initialiseEventHandlers();
    return fweMapService;
}]);

