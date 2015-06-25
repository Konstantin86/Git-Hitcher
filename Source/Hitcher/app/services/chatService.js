/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-local-storage.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

app.factory('chatService', ["appConst", "$rootScope", "$q", "$location", "$resource", "Hub", "$interval", "$timeout", "localStorageService", "authService",
    function (appConst, $rootScope, $q, $location, $resource, Hub, $interval, $timeout, localStorageService, authService) {

      var resource = $resource("/:action", { action: "api/chat" },
      {
        privateHistory: { method: "GET", isArray: true, params: { action: "api/chat/privateHistory" } },
        privateChats: { method: "GET", isArray: true, params: { action: "api/chat/privateChats" } }
      });

      var onMessageAddedHandler = [];

      var onMessageAdded = function (callback) { onMessageAddedHandler.push(callback); };

      var raiseEvent = function (callbacks) {
        if (callbacks.length) {
          callbacks.forEach(function (callback) {
            if (typeof (callback) == "function") { callback(); }
          });
        }
      };

      var clientId = localStorageService.get("clientId");

      if (!clientId) {
        clientId = "client:" + system.guid.newGuid();
        localStorageService.set("clientId", clientId);
      }

      var chat = { events: {} };

      chat.chats = [{ id: 0, title: "Public", messages: [] }];

      var updateTimer;

      var updateMsgTime = function () {
        if (chat.chats[chat.options.selected].messages && chat.chats[chat.options.selected].messages.length) {
          chat.chats[chat.options.selected].messages.forEach(function (msg) {
            var ts = new system.time.timeSpan(new Date(), new Date(msg.time));
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
                sent: chatMsg.clientId === clientId
              });

            });

            raiseEvent(onMessageAddedHandler);
          }
        });

        updateTimer = $interval(updateMsgTime, 60 * 1000);
      }

      //Hub setup
      var hub = new Hub("chatHub", {
        listeners: {
          'sendPublic': function (guid, userName, msg, photoPath) {
            addPublicMessage(0, guid, userName, msg, photoPath);
            $rootScope.$apply();
            raiseEvent(onMessageAddedHandler);
          },
          'sendPrivate': function (toUserId, fromUserId, userName, msg, photoPath) {
            addPrivateMessage(toUserId, fromUserId, userName, msg, photoPath);
          },
          'sendSelf': function (toUserId, userName, msg, photoPath) {
            addSelfMessage(toUserId, userName, msg, photoPath);
            $rootScope.$apply();
            raiseEvent(onMessageAddedHandler);
          }
        },
        methods: ['sendAsync', 'sendPrivateAsync'],
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
      hub.connection.qs = { "userId": authService.userData.isAuth ? authService.userData.id : clientId };

      var removePrivateChats = function () {
        for (var i = 1; i < chat.chats.length; i++) {
          chat.chats.splice(i, 1);
        }
      };

      authService.onLogout(function () {
        removePrivateChats();
        hub.disconnect();
        hub.connection.qs = { "userId": clientId };
        hub.connect();
      });

      authService.onGetUserData(function () {
        hub.disconnect();
        hub.connection.qs = { "userId": authService.userData.id };
        hub.connect();

        removePrivateChats();

        if (authService.userData.isAuth) {
          resource.privateChats({}, function (response) {
            if (response && response.length) {
              response.forEach(function (chatMsg) {

                var contactId = chatMsg.toUserId;

                if (contactId === authService.userData.id) {
                  contactId = chatMsg.fromUserId;
                }

                var contactUserName;

                // Take 1st userName that is not equal to currentUser username from the all messages between users:
                var usersMessages = response.filter(function (m) {
                  return (m.toUserId === authService.userData.id && m.fromUserId === contactId) || (m.fromUserId === authService.userData.id && m.toUserId === contactId);
                });

                usersMessages.forEach(function (um) {
                  if (um.userName !== authService.userData.userName) {
                    contactUserName = um.userName;
                  }
                });

                // Open chat tab between users:
                chat.open(contactId, contactUserName);

                var mins = parseInt(new system.time.timeSpan(new Date(), new Date(chatMsg.time)).getMinutes());

                // Add chat message:
                chat.chats[chat.options.selected].messages.push({
                  text: chatMsg.message,
                  userName: chat.chats[chat.options.selected].title,
                  timeLeft: mins > 0 ? mins + " мин." : "только что",
                  photo: chatMsg.photoPath,
                  time: new Date(chatMsg.time),
                  sent: chatMsg.fromUserId === authService.userData.id
                });


              });

              $timeout(function () {
                raiseEvent(onMessageAddedHandler);
              }, 500);
            }
          });
        }
      });

      chat.send = function (msg, userName, photoPath) {
        if (chat.chats[chat.options.selected].id === 0) {
          hub.sendAsync(clientId, userName, msg, photoPath);
        } else {
          hub.sendPrivateAsync(chat.chats[chat.options.selected].id, userName, msg, photoPath);
        }
      };

      chat.options = {
        visible: true,
        title: 'Чат',
        selected: 0
      };

      chat.init = init;

      chat.open = function (id, userName) {
        chat.options.visible = true;

        var chatWithId = chat.chats.filter(function (c) { return c.id === id; });

        if (chatWithId.length) {
          var index = chat.chats.getIndexByPropertyValue('id', id);
          chat.options.selected = index;
        } else {
          chat.chats.push({
            id: id,
            title: userName, messages: []
          });

          chat.options.selected = chat.chats.length - 1;
        }
      };

      chat.events.onMessageAdded = onMessageAdded;

      function addPublicMessage(chatIndex, guid, userName, msg, photoPath) {
        chat.chats[chatIndex].messages.push({
          text: msg,
          userName: userName,
          timeLeft: 'только что',
          photo: photoPath,
          time: new Date(),
          sent: guid === clientId
        });
      };

      function addPrivateMessage(toUserId, fromUserId, userName, msg, photoPath) {
        chat.open(fromUserId, userName);

        chat.chats[chat.options.selected].messages.push({
          text: msg,
          userName: chat.chats[chat.options.selected].title,
          timeLeft: 'только что',
          photo: photoPath,
          time: new Date(),
          sent: false
        });

        $rootScope.$apply();

        $timeout(function () {
          raiseEvent(onMessageAddedHandler);
        }, 200);
      }

      function addSelfMessage(toUserId, userName, msg, photoPath) {
        chat.open(toUserId);

        chat.chats[chat.options.selected].messages.push({
          text: msg,
          userName: userName,
          timeLeft: 'только что',
          photo: photoPath,
          time: new Date(),
          sent: true
        });
      }

      init();

      return chat;
    }]);