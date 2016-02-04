var translateApp = angular.module('translateApp', [
  'ui.bootstrap',
  'ui.router',
  'pascalprecht.translate'
]);

// Configure angular-translate
translateApp.config(function ($translateProvider) {

  $translateProvider
    .useStaticFilesLoader({
      prefix: 'config/languages/locale-',
      suffix: '.json'
    });

  $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
  $translateProvider.use('en');
});
