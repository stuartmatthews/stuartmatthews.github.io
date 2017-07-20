leafletApp.controller('fweMenuCtrl', ['$rootScope','$scope','$mdToast','$mdDialog', 'fweMapService','messageService','configService', function($rootScope,$scope, $mdToast,$mdDialog, fweMapService,messageService,configService) {
    //TODO watch value at push pin and digest when it changes
    
    var self=this;
    
    $rootScope.title = "FDR page"

    self.clicked = {};
    
    self.configData = configService.data;
    self.mapData = fweMapService.data;
    self.requestedTimeString = 'undefined';
    self.requestedTimeStep = 0;
    self.showWindBarbs = false;
    self.opacity =70; 
    self.showPaws = false;
    self.showAws = false;
    
    self.changeForecastLayer = function() {
        console.log(self.selectedLayer,configService.data.forecastLayers[self.selectedLayer].variable);
        
        //TODO add logic to preserve time if changing to a compatible layer (e.g. daily to daily)
        //Currently self.requestedTimeStep is retained which doesn't work if things don't happen to line up
        // self.requestedTimeStep = 0;
        fweMapService.loadForecastLayer(self.selectedLayer,self.requestedTimeStep,self.showWindBarbs,self.opacity/100);
    }
    
    self.updateTime = function () {
        self.requestedTimeString = fweMapService.calculateTimeStep(self.requestedTimeStep);
    }

    self.updateLayer = function () {
        self.requestedTimeString = fweMapService.calculateTimeStep(self.requestedTimeStep);
        fweMapService.setTimeStep(self.requestedTimeStep,self.showWindBarbs,self.opacity/100);
    }

    self.setOpacity = function () {
        fweMapService.setOpacity(self.opacity/100);
    }
    
    self.decTime = function () {
        self.requestedTimeStep = ((self.requestedTimeStep==0)?self.mapData.maxTimeStep:self.requestedTimeStep-1);
        self.requestedTimeString = fweMapService.calculateTimeStep(self.requestedTimeStep);
        self.updateLayer();
    }

    self.incTime = function () {
        self.requestedTimeStep = ((self.requestedTimeStep+1>self.mapData.maxTimeStep)?0:self.requestedTimeStep+1);
        self.requestedTimeString = fweMapService.calculateTimeStep(self.requestedTimeStep);
        self.updateLayer();
    }
    
    $scope.$on('layers', function(event,msg) {
        if (typeof msg=='string') {
            switch(msg) {
                case 'loaded':
                    self.updateTime();
                    self.slider_callbacks.options.ceil=fweMapService.data.maxTimeStep;
                    $scope.$broadcast('rzSliderForceRender');
                    
                default:
                    console.log("Unknown request to layers " +msg);
            }
        }
    });
        
    self.slider_callbacks = {
        options: {
            floor: 0,
            ceil: 0,
            hideLimitLabels: true,
            showTicks: true,
            showTicksValues: false,
            translate: function(value) {
                var displayString = "";
                try {
                    d = new Date(fweMapService.calculateTimeStep(value));
                    var displayString =  '';
                    if (configService.data.forecastLayers[self.selectedLayer].daily) {
                        displayString = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear();
                    } else {
                        displayString = ("0" + d.getDate()).slice(-2) + "/" + ("0"+(d.getMonth()+1)).slice(-2) + "/" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
                    }
                }
                catch(err) {
                    displayString = 'undefined';
                }
                return displayString;
            },
            onChange: function () {
                self.updateTime();
            },
            onEnd: function () {
                self.updateLayer();
            }
        }
    };
    self.slider_opacity = {
        value: self.opacity,
        options: {
            floor: 0.0,
            ceil: 100,
            step: 10,
            // precision: 1,
            hideLimitLabels: true,
            onEnd: function () {
                self.setOpacity();
            }
        }
    };
    
    
    self.selectedLayer = 0;
    self.changeForecastLayer(0);
}]);

