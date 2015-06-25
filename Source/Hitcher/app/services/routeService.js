/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/services/chatService.js"/>
/// <reference path="~/app/models/routeViewModel.js"/>

app.service("routeService", ["$resource", "$q", "$modal", "chatService", "appConst",
  function ($resource, $q, $modal, chatService, appConst) {

  var resource = $resource("/:action", { action: "api/route" },
  {
    mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
  });

  var getRouteViewModel = function (route, showUserPhoto) {

    var routeViewModel = new hitcher.viewModels.routeViewModel(route);
    routeViewModel.config = {
      showUserPhoto: showUserPhoto
    };
    routeViewModel.photoPath = appConst.cdnMediaBase + routeViewModel.photoPath;
    routeViewModel.events = {
      onApply: function () {
        chatService.open(routeViewModel.userId, routeViewModel.driver);
      }
    };
    routeViewModel.remove = function () {
      var deferred = $q.defer();

      var viewModel = this;

      var modal = $modal({ template: 'app/views/modal/yes-no-dialog.html', show: false });
      modal.$scope.title = 'Удаление маршрута';
      modal.$scope.content = 'Вы в своём уме?';
      modal.$scope.yes = function () {
        var modal = this;
        resource.delete({ id: viewModel.model.id }, function () {
          modal.$hide();
          deferred.resolve(viewModel.model.id);
        }, function () {
          this.$hide();
          deferred.reject();
        });
      }
      modal.$promise.then(modal.show);
      return deferred.promise;
    };


    return routeViewModel;
  };

  this.getRouteViewModel = getRouteViewModel;
  this.resource = resource;
}]);