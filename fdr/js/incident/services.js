angular.module('leafletApp').service('incidentService',['$http','messageService','configService',function($http, messageService,configService){
    var incidentService = {
        getNSW: function () {    
            var url = 'http://feeds.rfs.nsw.gov.au/majorincidents.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                var incidents = L.geoJson(
                    response.data, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            var id = feature.properties.guid.split('/').slice(-1)[0];
                            layer.bindPopup(
                                "<b>Name: " + feature.properties.title +"</b><br/>" +
                                '<a href="https://icon.rfs.nsw.gov.au/FireIncident/FireIncident/Review/' + id + '" target="_blank">ICON page</a>' +
                                '  -  <a href="https://icon.rfs.nsw.gov.au/FireIncident/FireIncident/IncidentIntel/' + id + '" target="_blank">Intel log</a><br>' +
                                ' <a href="https://fireweather.uat.rfs.nsw.gov.au/supervisor/reports/' + id + '.html" target="_blank">Incident overview</a><br>' +
                                feature.properties.description
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "Not Applicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Advice": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Watch and Act": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityWatchAndAct.png'
                                }),
                                "Emergency Warning": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityEmergencyWarning.png'
                                })
                            }
                            return L.marker(latlng, {icon: icons[feature.properties.category],title: feature.properties.title});
                        }
                })
                return incidents;
            });
            return promise;
        },
        getACT: function () {    
            var url = 'http://esa.act.gov.au/feeds/allincidents.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                //Convert json to valid geojson
                var features = []
                for (i=0;i<response.data.length;i++) {
                    if (response.data[i].state=='ACT') {
                        var feature = response.data[i];
                        feature.type = 'Feature';
                        feature.geometry = {
                            type: 'Point',
                            coordinates: [parseFloat(feature.point.coordinates[1]),parseFloat(feature.point.coordinates[0])]
                        },
                        features.push(feature);
                    }
                }
                var geojson = {
                    "type":"FeatureCollection",
                    "features": features
                };

                var incidents = L.geoJson(
                    geojson, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.title +"</b><br/>" +
                                feature.description
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                
                                "iconFireNotApplicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "iconFireClosed": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "iconFire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Watch and Act": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityWatchAndAct.png'
                                }),
                                "Emergency Warning": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityEmergencyWarning.png'
                                }),
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                            }
                            return L.marker(latlng, {icon: icons[feature.icon] || icons['other'],title: feature.title});
                        }
                })
                console.log(incidents);
                return incidents;
            });
            return promise;
        },
        getVIC: function () {    
            var url = 'http://emergency.vic.gov.au/public/osom-geojson.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                console.log(response);
                var incidents = L.geoJson(
                    response.data, {
                        filter: function(feature, layer) {
                            //Exclude BoM and interstate warnings
                            var validOrgs = ['VIC/DELWP','VIC/CFA','VIC/MFB','EMV']
                            return validOrgs.indexOf(feature.properties.sourceOrg)>-1;
                        },
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.properties.sourceTitle +"</b><br/>" 
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Not Applicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Advice": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Watch and Act": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityWatchAndAct.png'
                                }),
                                "Emergency Warning": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityEmergencyWarning.png'
                                })
                            }
                            return L.marker(latlng, {icon: icons[feature.properties.category1] || icons['other'],title: feature.properties.sourceTitle});
                        }
                })
                return incidents;
            });
            return promise;
        },
        getSA: function () {    
            var url = 'https://data.eso.sa.gov.au/prod/cfs/criimson/cfs_current_incidents.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                //Convert json to valid geojson
                var features = []
                for (i=0;i<response.data.length;i++) {
                    var feature = response.data[i];
                    var latlon = feature.Location;
                    feature.type = 'Feature';
                    feature.geometry = {
                        type: 'Point',
                        coordinates: [parseFloat(feature.Location.split(',')[1]),parseFloat(feature.Location.split(',')[0])]
                    },
                    features.push(feature);
                }
                var geojson = {
                    "type":"FeatureCollection",
                    "features": features
                };
                console.log(geojson);
                var incidents = L.geoJson(
                    features, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.Location_name +"</b><br/>" 
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Not Applicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Grass Fire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Forest Fire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                            }
                            return L.marker(latlng, {icon: icons[feature.Type] || icons['other'],title: feature.Location_name});
                        }
                })
                return incidents;
            });
            return promise;
        },
        getNT: function () {    
            var url = 'http://www.pfes.nt.gov.au/incidentmap/json/ntfrsincidents.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                //Convert json to valid geojson
                var features = []
                for (i=0;i<response.data.incidents.length;i++) {
                    var feature = response.data.incidents[i];
                    feature.type = 'Feature';
                    var latlon = feature.coordinate
                    feature.geometry = {
                        type: 'Point',
                        coordinates: [parseFloat(latlon.split(',')[1]),parseFloat(latlon.split(',')[0])]
                    },
                    features.push(feature);
                }
                var geojson = {
                    "type":"FeatureCollection",
                    "features": features
                };
                console.log(geojson);
                var incidents = L.geoJson(
                    features, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.location +"</b><br/>" 
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "fire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "advice": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                            }
                            return L.marker(latlng, {icon: icons[feature.category] || icons['other'],title: feature.location});
                        }
                })
                return incidents;
            });
            return promise;
        },
        getWA: function () {    
            var url = 'https://www.emergency.wa.gov.au/data/incident_FCAD.json'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url).then(function(response) {
                var incidents = L.geoJson(
                    response.data, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.properties.locationStreetName +"</b><br/>" 
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Not Applicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Bushfire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Burn off": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Fire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                            }
                            return L.marker(latlng, {icon: icons[feature.properties.type] || icons['other'],title: feature.properties.locationStreetName});
                        }
                })
                return incidents;
            });
            return promise;
        },
        getTAS: function () {    
            // var url = 'https://www.fire.tas.gov.au/gearth.jsp';
            var url = 'https://www.fire.tas.gov.au/Show?pageId=bfKml2';
            var cors_url = 'https://crossorigin.me/'+url;
            var incidents = omnivore.kml(cors_url);
            incidents.on('ready', function() {
                incidents.eachLayer(function(layer) {
                    layer.bindPopup(layer.feature.properties.description);
                });
            });
            return incidents;
        },
        getQLD: function () {    
            var url = 'https://www.ruralfire.qld.gov.au/bushfirealert/bushfireAlert.xml'
            var cors_url = 'https://crossorigin.me/'+url;
            var promise = $http.get(cors_url,{dataType: "xml"}).then(function(response) {
                //Convert geoRSS XML to JSON object
                xmlString = response.data; 
                var x2js = new X2JS();
                var georss = x2js.xml_str2json(xmlString);    
                
                //Now create a geoJSON object from the feed
                var features = []
                for (i=0;i<georss.feed.entry.length;i++) {
                    var feature = georss.feed.entry[i];
                    feature.type = 'Feature';
                    var latlon = feature.point.toString();
                    feature.geometry = {
                        type: 'Point',
                        coordinates: [parseFloat(latlon.split(' ')[1]),parseFloat(latlon.split(' ')[0])]
                    },
                    features.push(feature);
                }
                var geojson = {
                    "type":"FeatureCollection",
                    "features": features
                };
                console.log(geojson);
                var incidents = L.geoJson(
                    geojson, {
                        style: {color: "#000000"},
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(
                                "<b>Name: " + feature.title +"</b><br/>" +
                                feature.content
                            );
                        },
                        pointToLayer: function (feature, latlng) {
                            var icons = {
                                "other": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Not Applicable": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityNotApplicable.png'
                                }),
                                "Bushfire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Burn off": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                                "Fire": L.icon({
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                    iconUrl: 'images/severityAdvice.png'
                                }),
                            }
                            return L.marker(latlng, {icon:icons['other'],title: feature.title});
                        }
                })
                return incidents;
            });
            return promise;
        },
        
    }
    return incidentService;
}]);
