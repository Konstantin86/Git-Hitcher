app.factory('chatService', ["$http", "$rootScope", "$location", "Hub", "$timeout",
    function ($http, $rootScope, $location, Hub, $timeout) {

        var clientId = system.guid.newGuid();

        var Chats = this;

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
            methods: ['send'],
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
                sent: guid == clientId
        });
        };

        Chats.send = function (msg, userName, photoPath) {
            hub.send(clientId, userName, msg, photoPath);
        };

        Chats.options = {
            visible: true,
            title: 'test'
        };

        return Chats;
    }]);