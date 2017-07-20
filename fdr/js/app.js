'use strict';

/* App Module */
var leafletApp = angular.module('leafletApp',['rzModule','ngMaterial','ngMessages','ngResource','ngRoute']);

leafletApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/fwe.html',
        controller: 'AppCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
  
leafletApp.config(function($mdThemingProvider) {
    //Created using https://angular-md-color.com/
    //Based on RFS style guide:
    //Primary: #E5281B
    //Accent: #464749
    //Warn: #E5281B
    //Background: #FFFFFF
    
    var ruralFireServicePrimary = {
        '50': '#f2948d',
        '100': '#ef7e77',
        '200': '#ed6960',
        '300': '#ea5349',
        '400': '#e83e32',
        '500': '#E5281B',
        '600': '#cf2318',
        '700': '#b81f15',
        '800': '#a11c12',
        '900': '#8a1810',
        'A100': '#f5a9a4',
        'A200': '#f7bfbb',
        'A400': '#fad5d2',
        'A700': '#73140d',
        'contrastDefaultColor': 'light',
    
    };
    $mdThemingProvider.definePalette('ruralFireServicePrimary', ruralFireServicePrimary);

    var ruralFireServiceAccent = {
        '50': '#000000',
        '100': '#080808',
        '200': '#141415',
        '300': '#212122',
        '400': '#2d2e2f',
        '500': '#393a3c',
        '600': '#525456',
        '700': '#5f6063',
        '800': '#6b6d70',
        '900': '#787a7d',
        'A100': '#525456',
        'A200': '#464749',
        'A400': '#393a3c',
        'A700': '#85868a',
        'contrastDefaultColor': 'light',
    };
    $mdThemingProvider.definePalette('ruralFireServiceAccent', ruralFireServiceAccent);

    var ruralFireServiceWarn = {
        '50': '#f2948d',
        '100': '#ef7e77',
        '200': '#ed6960',
        '300': '#ea5349',
        '400': '#e83e32',
        '500': '#E5281B',
        '600': '#cf2318',
        '700': '#b81f15',
        '800': '#a11c12',
        '900': '#8a1810',
        'A100': '#f5a9a4',
        'A200': '#f7bfbb',
        'A400': '#fad5d2',
        'A700': '#73140d',
        'contrastDefaultColor': 'light',
    };
    $mdThemingProvider.definePalette('ruralFireServiceWarn', ruralFireServiceWarn);

    // var ruralFireServiceBackground = {
        // '50': '#ffffff',
        // '100': '#ffffff',
        // '200': '#ffffff',
        // '300': '#ffffff',
        // '400': '#ffffff',
        // '500': '#ffffff',
        // '600': '#f2f2f2',
        // '700': '#e6e6e6',
        // '800': '#d9d9d9',
        // '900': '#cccccc',
        // 'A100': '#ffffff',
        // 'A200': '#ffffff',
        // 'A400': '#ffffff',
        // 'A700': '#bfbfbf',
        // 'contrastDefaultColor': 'dark',
    // };
    // $mdThemingProvider.definePalette('ruralFireServiceBackground', ruralFireServiceBackground);

   $mdThemingProvider.theme('default')
       .primaryPalette('ruralFireServicePrimary')
       .accentPalette('ruralFireServiceAccent')
       .warnPalette('ruralFireServiceWarn');
       // .backgroundPalette('ruralFireServiceBackground');
});
       