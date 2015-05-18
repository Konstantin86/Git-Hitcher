app.controller('testChatController', ["$scope", "chatService", function testChatController($scope, chatService) {
    //Enter controller code here
    $scope.chats = chatService;
    $scope.username = prompt('Enter your name:', '');
    $scope.sendChat = function () {
        $scope.chats.send($scope.username, $scope.message);
        $('#message').val('').focus();
    }
}]);