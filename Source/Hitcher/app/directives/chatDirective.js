﻿// JQuery usage is a bad style in angularJs app, but currently due to lack of knowledge in how to apply the same anumations with angular, jquery is temporarily used

app.directive('chatView', function () {
    return {
        restrict: 'E',
        scope: {
            options: '=',
            messages: '=',
            message: '=',
        },
        templateUrl: "/app/directives/chatView.html",
        link: function (scope, elem, attrs, ctrl, ngModel) {

            if (!scope.options) {
                scope.options = { visible: true };
            }

            if (!scope.messages) {
                scope.messages = [];
            }

            //scope.$watch('inputValue', function (newValue, oldValue) {
            //});

            scope.minimize = function () {
                var $this = $('.panel-heading span.icon_minim');
                if (!$this.hasClass('panel-collapsed')) {
                    $this.parents('.panel').find('.panel-body').slideUp();
                    $this.addClass('panel-collapsed');
                    $this.removeClass('glyphicon-minus').addClass('glyphicon-plus');
                } else {
                    $this.parents('.panel').find('.panel-body').slideDown();
                    $this.removeClass('panel-collapsed');
                    $this.removeClass('glyphicon-plus').addClass('glyphicon-minus');
                }
            };

            scope.close = function () {
                scope.options.visible = false;
            };

            scope.send = function () {
                scope.messages.push({
                    text: scope.message,
                    userName: 'testUser',
                    timeLeft: '52 min',
                    sent: true
                });
                // TODO implement add message logic...
            };
        }
    };
});