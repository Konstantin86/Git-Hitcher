/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/services/chatService.js"/>
/// <reference path="~/app/models/routeViewModel.js"/>

"use strict";

app.service("routeService", function ($resource, $q, $modal, chatService, appConst) {

    var resource = $resource(appConst.serviceBase + "/:action", { action: "api/route" },
    {
        mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
    });

    var getRouteViewModel = function (route, showUserPhoto) {

        var routeViewModel = new hitcher.viewModels.routeViewModel(route);
        routeViewModel.config = {
            showUserPhoto: showUserPhoto
        };
        routeViewModel.events = {
            onApply: function () {
                //alert('You have applied ' + routeViewModel.userId);

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
                resource.delete({ id: viewModel.model.id }, function (response) {
                    modal.$hide();
                    deferred.resolve(viewModel.model.id);
                }, function (response) {
                    this.$hide();
                    deferred.reject();
                    //statusService.error(errorService.parseDataError(response));
                });
            }
            modal.$promise.then(modal.show);
            return deferred.promise;
        };


        return routeViewModel;
    };

    this.getRouteViewModel = getRouteViewModel;
    this.resource = resource;
});