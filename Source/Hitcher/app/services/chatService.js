app.factory('chatService', ["appConst", "$rootScope", "$location", "$resource", "Hub", "$interval", "localStorageService", "authService",
    function (appConst, $rootScope, $location, $resource, Hub, $interval, localStorageService, authService) {

        var resource = $resource(appConst.serviceBase + "/:action", { action: "api/chat" },
        {
            //mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
        });

        var clientId = localStorageService.get("clientId");

        if (!clientId) {
            clientId = system.guid.newGuid();
            localStorageService.set("clientId", clientId);
        }

        var chat = {};

        chat.chats = [{ id: 0, title: "Public", messages: [] }];
        //chat.selected = 1;

        var updateTimer;

        var updateMsgTime = function () {
            if (chat.chats[chat.selected].messages && chat.chats[chat.selected].messages.length) {
                chat.chats[chat.selected].messages.forEach(function (msg) {
                    var ts = new system.time.timeSpan(new Date(), msg.time);
                    var mins = parseInt(ts.getMinutes());
                    msg.timeLeft = mins > 0 ? mins + " мин." : "только что";
                });
            }
        }

        var init = function () {

            // todo get temp chat history:
            resource.query({}, function (response) {
                if (response && response.length) {

                    // TODO sort by time:
                    response.sort(function (a, b) {
                        var timeDiff = function (time) {
                            var aTimeSpans = new system.time.timeSpan(new Date(), new Date(time));
                            return aTimeSpans.timeDiff;
                        }

                        return timeDiff(a.time) <= timeDiff(b.time);
                    });

                    response.forEach(function (chatMsg) {

                        var mins = parseInt(new system.time.timeSpan(new Date(), new Date(chatMsg.time)).getMinutes());

                        chat.chats[0].messages.push({
                            text: chatMsg.message,
                            userName: chatMsg.userName,
                            timeLeft: mins > 0 ? mins + " мин." : "только что",
                            photo: chatMsg.photoPath,
                            time: system.time.convertToUTCDate(new Date(chatMsg.time)),
                            sent: chatMsg.clientId == clientId
                        });

                    });
                }
            });

            updateTimer = $interval(updateMsgTime, 60 * 1000);
        }

        //Hub setup
        var hub = new Hub("chatHub", {
            listeners: {
                'addNewMessageToPage': function (guid, userName, msg, photoPath) {
                    addPublicMessage(0, guid, userName, msg, photoPath);
                    $rootScope.$apply();
                },
                'sendTest': function (msg) {
                    //Chats.add('', '', msg, '');
                    $rootScope.$apply();
                }
            },
            methods: ['send', 'sendAsync', 'sendAsyncTest'],
            errorHandler: function (error) {
                console.error(error);
            },
            hubDisconnected: function () {
                if (hub.connection.lastError) {
                    hub.connection.start();
                }
            },
            transport: 'webSockets',
            logging: true
        });
        hub.connection.qs = { "userId": authService.userData.id };

        authService.onGetUserData(function () {
            hub.disconnect();
            hub.connection.qs = { "userId": authService.userData.id };
            hub.connect();
        });

        chat.send = function (msg, userName, photoPath) {
            hub.sendAsync(clientId, userName, msg, photoPath);
            //hub.sendAsyncTest("199fdbe5-81fc-41d9-bb2d-b17ece826147", msg);
            //hub.sendAsyncTest(authService.userData.id, msg);
        };

        chat.options = {
            visible: true,
            title: 'Общий чат',
            selected: 1
        };

        chat.init = init;

        chat.open = function (id, userName) {
            chat.options.visible = true;

            var chatWithId = chat.chats.filter(function (c) { return c.id === id; });

            if (chatWithId.length) {
                var index = chat.chats.getIndexByPropertyValue('id', id);
                chat.options.selected = index;
                $rootScope.$apply();
            } else {
                chat.chats.push({
                    id: id,
                    title: userName, messages: []
                });

                chat.options.selected = chat.chats.length - 1;
                $rootScope.$apply();
            }
        };

        function addPublicMessage(chatIndex, guid, userName, msg, photoPath) {
            chat.chats[chatIndex].messages.push({
                text: msg,
                userName: userName,
                timeLeft: 'только что',
                photo: photoPath,
                time: new Date(),
                sent: guid == clientId
            });
        };

        init();

        return chat;
    }]);