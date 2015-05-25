app.factory('chatService', ["appConst", "$rootScope", "$location", "$resource", "Hub", "$interval", "localStorageService", "authService",
    function (appConst, $rootScope, $location, $resource, Hub, $interval, localStorageService, authService) {

        var resource = $resource(appConst.serviceBase + "/:action", { action: "api/chat" },
        {
            // query is pointing out to the temp public chat history
            //mostRecent: { method: "GET", params: { action: "api/route/mostRecent" } }
        });

        var clientId = localStorageService.get("clientId");

        if (!clientId) {
            clientId = system.guid.newGuid();
            localStorageService.set("clientId", clientId);
        }

        var Chats = this;

        var updateTimer;

        var updateMsgTime = function () {
            if (Chats.all && Chats.all.length) {
                Chats.all.forEach(function (msg) {
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

                        Chats.all.push({
                            text: chatMsg.message,
                            userName: chatMsg.userName,
                            timeLeft: mins > 0 ? mins + " мин." : "только что",
                            photo: chatMsg.photoPath,
                            time: system.time.convertToUTCDate(new Date(chatMsg.time)),
                            sent: chatMsg.clientId == clientId
                        });

                    });

                    //var ts = new system.time.timeSpan(new Date(), system.time.convertToUTCDate(new Date(response[0].time)));

                }
            });

            updateTimer = $interval(updateMsgTime, 60 * 1000);
        }

        init();

        //Chat ViewModel
        var Chat = function (chat) {
            if (!chat) chat = {};

            var Chat = {
                UserName: chat.UserName || 'UserX',
                ChatMessage: chat.ChatMessage || 'MessageY'
            }

            return Chat;
        }

        //Hub setup
        var hub = new Hub("chatHub", {
            listeners: {
                'addNewMessageToPage': function (guid, userName, msg, photoPath) {
                    Chats.add(guid, userName, msg, photoPath);
                    $rootScope.$apply();
                },
                'sendTest': function (msg) {
                    Chats.add('', '', msg, '');
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

        Chats.all = [];

        Chats.add = function (guid, userName, msg, photoPath) {
            //Chats.all.push(new Chat({ UserName: userName, ChatMessage: chatMessage }));
            Chats.all.push({
                text: msg,
                userName: userName,
                timeLeft: 'только что',
                photo: photoPath,
                time: new Date(),
                sent: guid == clientId
            });
        };

        Chats.send = function (msg, userName, photoPath) {
            //hub.send(clientId, userName, msg, photoPath);
            //hub.connection.qs = "myInfo=12345";
            //hub.connection.qs = { "myInfo": "223" };
            hub.sendAsync(clientId, userName, msg, photoPath);
            //hub.sendAsyncTest("199fdbe5-81fc-41d9-bb2d-b17ece826147", msg);
            //hub.sendAsyncTest(authService.userData.id, msg);
        };

        Chats.options = {
            visible: true,
            title: 'Общий чат'
        };

        Chats.reset = function () {
            $timeout.cancel(updateTimer);
            updateTimer = null;
            //Chats.all = [];
        }

        Chats.init = init;

        return Chats;
    }]);