﻿/// <reference path="~/scripts/angular.min.js"/>
/// <reference path="~/scripts/angular-local-storage.js"/>
/// <reference path="~/app/app.js"/>
/// <reference path="~/app/const/appConst.js"/>

app.service("authService", ["$resource", "$q", "localStorageService", "appConst", function ($resource, $q, localStorageService, appConst) {
  var resource = $resource("/:action", { action: "api/auth" },
  {
    getLocalAccessToken: { method: "GET", params: { action: "api/auth/localaccesstoken" } },
    registerExternal: { method: "POST", params: { action: "api/auth/registerexternal" } },
    resetPassword: { method: "GET", params: { action: "api/auth/password" } },
    updatePassword: { method: "PUT", params: { action: "api/auth/password" } },
    update: { method: "PUT" },
    token: { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, params: { action: "token" } }
  });

  var userData = {};
  var externalAuthData = { provider: "", userName: "", email: "", externalAccessToken: "", password: "", confirmPassword: "" };

  var onLogoutCallbacks = [];
  var onGetUserDataCallbacks = [];

  var onLogout = function (callback) { onLogoutCallbacks.push(callback); };
  var onGetUserData = function (callback) { onGetUserDataCallbacks.push(callback); };

  var raiseEvent = function (callbacks) {
    if (callbacks.length) {
      callbacks.forEach(function (callback) {
        if (typeof (callback) == "function") { callback(); }
      });
    }
  };

  var logout = function () {
    localStorageService.remove("authorizationData");
    userData.isAuth = false;
    userData.userName = "";

    // Clear userData
    userData.photoPath = null;
    //userData = {};

    raiseEvent(onLogoutCallbacks);
  };

  var saveAuthData = function (accessToken, userName) {
    localStorageService.set("authorizationData", { token: accessToken, userName: userName });
    userData.isAuth = true;
    userData.userName = userName;
  };

  var getUserData = function () {
    resource.get({}, function (user) {
      userData.id = user.id;
      userData.firstName = user.firstName;
      userData.lastName = user.lastName;
      userData.sex = user.sex;
      userData.birthDate = user.birthDate;
      userData.phoneNumber = user.phoneNumber;
      userData.joinDate = user.joinDate;
      userData.country = user.country;
      userData.isExternal = user.hasExternalLogins;
      userData.city = user.city;
      userData.photoPath = appConst.cdnMediaBase + user.photoPath + "?width=" + appConst.userPhotoWidth;

      raiseEvent(onGetUserDataCallbacks);
    }, function () {
      //userData.isAuth = false;    // Supposely authentication header obtained from browser storage is outdated and we most likely receive an unauthorized error here.
      logout();    // Supposely authentication header obtained from browser storage is outdated and we most likely receive an unauthorized error here.
    });
  };

  var login = function (credentials) {
    var deferred = $q.defer();

    var onLoginSucceed = function (response) {
      saveAuthData(response.access_token, credentials.userName);
      getUserData();
      userData.isExternal = false;
      deferred.resolve(response);
    };

    var onLoginFailed = function (response) {
      deferred.reject(response);
    };

    resource.token("grant_type=password&username=" + credentials.userName + "&password=" + credentials.password, onLoginSucceed, onLoginFailed);

    return deferred.promise;
  };

  var init = function () {
    var authorizationData = localStorageService.get('authorizationData');
    if (authorizationData) {
      userData.isAuth = true;
      userData.userName = authorizationData.userName;
      getUserData();
    }
  };

  var obtainAccessToken = function (externalData) {
    var deferred = $q.defer();

    resource.getLocalAccessToken({ provider: externalData.provider, externalAccessToken: externalData.externalAccessToken, userId: externalData.userId }, function (response) {
      saveAuthData(response.access_token, response.userName);
      getUserData();
      userData.isExternal = true;
      deferred.resolve(response);
    }, function (err) {
      deferred.reject(err);
    });

    return deferred.promise;
  };

  var getAuthHeader = function () { return "Bearer " + localStorageService.get("authorizationData").token; };
  var setPhoto = function (fileName) { userData.photoPath = appConst.cdnMediaBase + fileName + "?width=" + appConst.userPhotoWidth; };

  this.login = login;
  this.logout = logout;
  this.init = init;
  this.userData = userData;
  this.externalAuthData = externalAuthData;
  this.setPhoto = setPhoto;
  this.getAuthHeader = getAuthHeader;
  this.obtainAccessToken = obtainAccessToken;
  this.auth = resource;
  this.onLogout = onLogout;
  this.onGetUserData = onGetUserData;
}]);