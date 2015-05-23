app.factory('chatService', ["$http", "$rootScope", "$location", "Hub", "$interval",
    function ($http, $rootScope, $location, Hub, $interval) {

        var clientId = system.guid.newGuid();

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

        var init = function() {
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
                }
            },
            methods: ['send', 'sendAsync'],
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
            hub.sendAsync(clientId, userName, msg, photoPath);
        };

        Chats.options = {
            visible: true,
            title: 'Общий чат'
        };

        Chats.reset = function() {
            $timeout.cancel(updateTimer);
            updateTimer = null;
            //Chats.all = [];
        }

        Chats.init = init;

        return Chats;
    }]);