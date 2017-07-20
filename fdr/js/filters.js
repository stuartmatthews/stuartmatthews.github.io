'use strict';
angular.module('leafletApp').
    filter('fuelTable', ['$filter', function ($filter) {
        return function (input, fractionSize,key) {
            if (key=="fireHistory") {
                return input;
            } else if (key=="id") {
                return input;
            } else if (isNaN(input)) {
                return input;
            } else if (input<0) {
                return "NA";
            } else {
                return $filter('number')(input, fractionSize);
            };
        };
    }]);
/* Filters */
