/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-resource.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/models/routeViewModel.js"/>

"use strict";

app.service("routeService", function ($resource, $q, $modal, appConst) {

    var resource = $resource(appConst.serviceBase + "/:action", { action: "api/route" },
    {
        mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
    });

    var get = function () {

        return [
            {
                start: {
                    latlng: "49.941001,36.301818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "50.0210186,36.2179946",
                    name: "Харьков, героев сталинграда 136б"
                }
            },
            {
                start: {
                    latlng: "49.922001,36.321818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "50.0410186,36.2079946",
                    name: "Харьков, героев сталинграда 136б"
                }
            },
            {
                start: {
                    latlng: "49.522001,36.021818000000026",
                    name: "Харьков, Новгородская 3б"
                },
                end: {
                    latlng: "51.0410186,35.9079946",
                    name: "Харьков, героев сталинграда 136б"
                }
            }
        ];
    };

    var getRouteViewModel = function (route, showUserPhoto) {

        var routeViewModel = new hitcher.viewModels.routeViewModel(route);
        routeViewModel.config = {
            showUserPhoto: showUserPhoto
        };
        routeViewModel.events = {};
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
    this.get = get;
    this.resource = resource;
});