(function() {
  'use strict';

  angular
    .module('gulpAngularProfiledBuild')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
