/*jshint node:true*/
'use strict';

module.exports = function(/* environment, appConfig */) {
  return {
    resizeServiceDefaults: {
      debounceTimeout    : 200,
      heightSensitive    : true,
      widthSensitive     : true,
      injectionFactories : [ 'view', 'component']
    }
  };
};
