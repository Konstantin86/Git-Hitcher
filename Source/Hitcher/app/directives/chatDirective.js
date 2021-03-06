﻿/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>
/// <reference path="~/app/services/authService.js"/>
/// <reference path="~/app/services/chatService.js"/>

// JQuery usage is a bad style in angularJs app, but currently due to lack of knowledge in how to apply the same anumations with angular, jquery is temporarily used

// TODO 
// Use bootstrab tabs control to switch between chats (public or private ones)
// Perform the following logic on switch
// - load last messages either for public chart of from selected user id
// - create additional abstraction in the service that will hold array of chats
app.directive("chatView", ["appConst", "authService", "chatService", function (appConst, authService, chatService) {
    return {
        restrict: "E",
        scope: {
            options: "=",
            chats: "=",
            selected: "=",
            messages: "=",
            message: "="
        },
        templateUrl: "/app/directives/chatView.html",
        link: function (scope, elem, attrs, ctrl, ngModel) {

            if (!scope.options) {
                scope.options = { visible: true };
            }

            if (!scope.messages) {
                scope.messages = [];
            }

            var scrollToBottom = function() {
                var scrollHeight = $('.msg_container_base')[scope.options.selected].scrollHeight;
                $('.msg_container_base')[scope.options.selected].scrollTop = scrollHeight;
            };

            chatService.events.onMessageAdded(scrollToBottom);

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

            var send = function () {

                if (!scope.message) {
                    return;
                }

                var photoPath = authService.userData.photoPath || appConst.cdnMediaBase + "default_avatar.png";
                photoPath = photoPath.split("?width")[0] + "?width=" + appConst.chatPhotoWidth;
                chatService.send(scope.message, authService.userData.userName || 'аноним', photoPath);

                scope.message = "";
                //$('#message').val('').focus();
                // TODO implement add message logic...
            };

            // TODO timer that updates times when messages were sent
            //var timeDiff = new system.time.timeSpan()

            scope.keyPress = function (code) {
                if (code === 13) {
                    send();
                }
            };

            scope.send = send;

            $("#myDiv").draggable();
            //$("#myDiv")[0].draggable = true;
        }
    };
}]);