app.directive('formatPhone', [
        function () {
            return {
                require: 'ngModel',
                restrict: 'A',
                link: function (scope, elem, attrs, ctrl, ngModel) {

                    scope.$watch('formData.phoneNumber', function (newValue, oldValue) {
                        newValue = newValue.replace(new RegExp('-', 'g'), '');
                        var arr = String(newValue).split("");
                        if (arr.length === 0) return;
                        if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.')) return;
                        if (arr.length === 2 && newValue === '-.') return;
                        if (isNaN(newValue)) {
                            scope.formData.phoneNumber = oldValue;
                        }

                        if (newValue) {
                            var origVal = newValue.replace(/[^\w\s]/gi, '');
                            if (origVal.length === 10) {
                                var str = origVal.replace(/(.{3})/g, "$1-");
                                var phone = str.slice(0, -2) + str.slice(-1);
                                scope.formData.phoneNumber = phone;
                            }
                        }
                    });

                    //elem.add(phonenumber).on('keyup', function () {
                    //    var origVal = elem.val().replace(/[^\w\s]/gi, '');
                    //    if (origVal.length === 10) {
                    //        var str = origVal.replace(/(.{3})/g, "$1-");
                    //        var phone = str.slice(0, -2) + str.slice(-1);
                    //        jQuery("#phonenumber").val(phone);
                    //    }

                    //});
                }
            };
        }
]);