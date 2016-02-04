translateApp.controller('MainController', function ($translate, $scope) {

  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
  };

  $scope.gender = 'male';

});
