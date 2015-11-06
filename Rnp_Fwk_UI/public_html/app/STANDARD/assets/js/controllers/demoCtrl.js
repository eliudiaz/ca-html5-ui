'use strict';
/** 
 * controllers used for the dashboard
 */
app.controller('demoCtrl', ["$scope", "Query", "$timeout", 'SweetAlert', "cfpLoadingBar", function ($scope, Query, $timeout, SweetAlert, cfpLoadingBar) {
        $scope.automatic = false;
        $scope.manual = false;
        $scope.manualBio = false;
        $scope.noImage = true;
        $scope.dpiReady = false;
        $scope.busyReadDPI = false;
        $scope.busyMatching = false;
        $scope.alerts = [];
        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
        $scope.addAlert = function ($type, $msg) {
            $scope.alerts.push({
                msg: $msg, type: $type
            });
        };
        $scope.closeAllAlert = function () {
            $scope.alerts = [];
        };

        $scope.verificaBioManual = function () {
            $scope.busyMatching = true;
        };
        $scope.defCallBack = function () {
        };
        $scope.leerDPI = function () {
            cfpLoadingBar.start();
            cfpLoadingBar.set(0.3);
            $scope.defCallBack = $scope.parseDPIData;
            Query.get('http://localhost:4567/push-dpi-read', function (r, e) {                
                $scope.getPushStatus(r.id);
            });            
        };
        $scope.getPushStatus = function (id) {
            var rId = id;
            Query.get('http://localhost:4567/get-status?id=' + id, function (r, e) {
                if (r.ready) {
                    $scope.getPushResult(rId);
                } else {
                    $timeout(function () {
                        $scope.getPushStatus(rId);
                    }, 1000);
                }
            });
        };
        $scope.getPushResult = function (id) {
            Query.get('http://localhost:4567/get-result?id=' + id, function (r, e) {
                cfpLoadingBar.set(0.6);
                $scope.defCallBack(r.data);
                cfpLoadingBar.complete();
            });
        };
        $scope.persona = {nombres: "", apellidos: "", fechaNacimiento: "", paisNacimiento: ""};
        $scope.dpiReadRest = 0;
        $scope.parseDPIData = function (r) {
            $scope.busyReadDPI = false;
            $scope.dpiReady = true;
            $scope.dpiReadRest = r === null ? 0 : 1;
            if ($scope.dpiReadRest <= 0) {
                SweetAlert.swal({
                    title: "Lectura fallida!",
                    text: "No ha sido posible la lectura del DPI!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Rintentar!"
                }, function (isConfirm) {
                    if (isConfirm) {
                        $scope.leerDPI();
                    }
                });
                $scope.dpiReady = false;
            } else {
                $scope.persona = r;
                $scope.noImage = false;
                SweetAlert.swal({
                    title: "Lectura exitosa!",
                    text: "Los datos del DPI han sido leidos!",
                    type: "success",
                    confirmButtonColor: "#007AFF"
                });
            }
        };
        $scope.leerHuella = function () {
            $scope.busyMatching = true;
            $scope.progress = 0.3;
            cfpLoadingBar.start();
            $scope.addAlert("info", "Coloque su dedo indice derecho en el lector!");
            $scope.addAlert("info", "Espere a que la luz cambie a roja!");
            Query.get('http://localhost:4567/read-finger', function (r, e) {
                cfpLoadingBar.set(0.6);
                $scope.parseDPIData(r);
            });
        };
        $scope.matchHuella = function () {
            $scope.busyMatching = true;
            $scope.progress = 0.3;
            $scope.addAlert("info", "Coloque su dedo indice en el lector cuando encienda la luz!");
            cfpLoadingBar.start();
            cfpLoadingBar.set($scope.progress);
            $scope.waitMatchRes();
        };
        $scope.progress = 0;
        $scope.matchResult = 0;
        $scope.waitMatchRes = function () {
            $timeout(function () {
                $scope.progress = $scope.progress + 0.3;
                cfpLoadingBar.set($scope.progress);
                if ($scope.progress >= 1) {
                    cfpLoadingBar.complete();
                    $scope.busyMatching = false;
                    $scope.matchResult = 0;
                    $scope.parseMatchResult();
                } else {
                    $scope.waitMatchRes();
                }
            }, 1000);
        };
        $scope.parseMatchResult = function () {
            if ($scope.matchResult <= 0) {
                $scope.addAlert("danger", "Verificacion fallida: Huella no coincide!");
            }
            if ($scope.matchResult > 0) {
                $scope.addAlert("success", "Verificacion exitosa!");
            }
        };
        $scope.persona = {
            cui: '',
            nombres: '',
            apellidos: '',
            paisNacimiento: '',
            nacionalidad: '',
            foto: ''
        };
        $scope.persona_rnp = {
            cui: '',
            nombres: '',
            apellidos: '',
            paisNac: '',
            nacionalidad: '',
            estadoCivil: '',
            estado: '',
            conyuge: ''
        };

        /*  $scope.leerDPI = function () {
         cfpLoadingBar.start();
         $timeout(function () {
         cfpLoadingBar.set(0.3);
         }, 1000);
         $timeout(function () {
         cfpLoadingBar.set(0.6);
         }, 2000);
         $timeout(function () {
         cfpLoadingBar.complete();
         }, 5000);
         };*/
    }]);
