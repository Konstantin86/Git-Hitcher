/// <reference path="~/scripts/angular.min.js"/>

/// <reference path="~/app/app.js"/>

"use strict";

app.constant("msgConst", {
    "HOME_WELCOME": "Yet another fitness results tracker...",
    "HOME_WELCOME_HEADER": "KeepFit",
    "ACCOUNT_DELETE": "Are you sure you want to delete your account from system?",
    "ACCOUNT_UPDATE_SUCCESS": "User profile is updated successfully",
    "ACCOUNT_PWD_CHANGE_SUCCESS": "User password has been changed successfully",
    "ACCOUNT_ASSOCIATE_SUCCESS": "User has been registered successfully, you will be redicted to workouts page in 2 seconds.",
    "ACCOUNT_ASSOCIATE_FAIL_FORMAT": "Failed to register user due to: {0}.",
    "UNEXPECTED_SERVER_ERROR": "Unexpected error happened",
    "LOGIN_UNRECOGNIZED_ERROR": "Unrecognized error happened during user authentication",
    "LOGIN_PWD_RECOVERY_INSTRUCTIONS": "Provide your e-mail address below and click 'Yes'",
    "LOGIN_PWD_RECOVERY_LINK_SENT_FORMAT": "Password recovery link has been just sent to {0}.",
    "SIGNUP_SUCCESS_FORMAT": "User {0} has been registered in the system. In order to complete a registration you need to confirm your e-mail account. Verification message has been just sent to {1}.",
    "SIGNUP_FAIL_FORMAT": "Failed to register user due to: {0}",
    "SIGNUP_SUCCESS_CONFIRM": "Congratulations. You has just successfully confirmed your email. Now you can login using your credentials. You'll be redirected to login page automatically in 5 seconds."
});