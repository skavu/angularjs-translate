translateApp.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('main', {
      url: '/',
      templateUrl: 'scripts/components/main/index.html',
      controller: 'MainController'
    })

});
