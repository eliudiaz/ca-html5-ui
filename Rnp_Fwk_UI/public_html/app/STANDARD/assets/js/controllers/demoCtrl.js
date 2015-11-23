'use strict';
/** 
 * controllers used for the dashboard
 */
app.controller('demoCtrl', ["$scope", "Query", "$timeout", 'SweetAlert', "cfpLoadingBar", "$document", "$modal", function ($scope, Query, $timeout, SweetAlert, cfpLoadingBar, $document, $modal) {
        $scope.automatic = false;
        $scope.manual = false;
        $scope.manualBio = false;
        $scope.noImage = true;
        $scope.dpiReady = false;
        $scope.busyReadDPI = false;
        $scope.busyMatching = false;
        $scope.alerts = [];
        $scope.scrollTo = function (e) {
            $timeout(function () {
                var someElement = angular.element(document.getElementById(e));
                $document.scrollToElement(someElement, 50, 500);
            }, 500);
        };
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

        $scope.defCallBack = function () {
        };

        $scope.timeOutPush = 5000;
        $scope.onTimeoutCallBack = function () {
        };
        $scope.onError = function (e) {
            cfpLoadingBar.complete();
            SweetAlert.swal({
                title: "Error realizando solicitud!",
                text: e.message,
                type: "warning",
                showCancelButton: true
            });
        };
        $scope.cancelPush = function (id) {
            $timeout(function () {
                Query.get('http://localhost:4567/push-cancel?id=' + id, function (r, e) {
                    if (e !== null) {
                        $scope.onError(e);
                        return;
                    }
                });
            }, 100);
        };
        $scope.getPushStatus = function (id) {
            var rId = id;
            Query.get('http://localhost:4567/get-status?id=' + id, function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    return;
                }
                if (r.ready) {
                    $scope.getPushResult(rId);
                } else {
                    if ($scope.timeOutPush <= 0) {
                        SweetAlert.swal({
                            title: "Tiempo de espera agotado!",
                            text: "La solicitud ha tomado mas del tiempo aceptable, pruebe nuevamente.",
                            type: "warning",
                            showCancelButton: false,
                            confirmButtonColor: "#DD6B55",
                        }, function () {
                            $scope.cancelPush(rId);
                            $scope.timeOutPush = 5000;
                            $scope.onTimeoutCallBack();
                            cfpLoadingBar.complete();
                        });
                    } else {
                        $scope.timeOutPush = $scope.timeOutPush - 1000;
                        $timeout(function () {
                            $scope.getPushStatus(rId);
                        }, 1000);
                    }
                }
            });
        };
        $scope.complete = true;
        $scope.getPushResult = function (id) {
            Query.get('http://localhost:4567/get-result?id=' + id, function (r, e) {
                $scope.complete = true;
                if (e !== null) {
                    cfpLoadingBar.complete();
                    $scope.onError(e);
                    return;
                }
                cfpLoadingBar.set(0.6);
                $scope.defCallBack(r.data);
                if ($scope.complete) {
                    cfpLoadingBar.complete();
                }
            });
        };
        $scope.persona = {nombres: "", apellidos: "", fechaNacimiento: "", paisNacimiento: ""};
        $scope.dpiReadRest = 0;
        $scope.leerDPI = function () {
            $scope.timeOutPush = 20000;
            cfpLoadingBar.start();
            $scope.defCallBack = $scope.parseDPIData;
            Query.get('http://localhost:4567/push-dpi-read', function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    return;
                }
                $scope.getPushStatus(r.id);
            });
        };
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
                if ($scope.afterLeerDPI !== null) {
                    $scope.afterLeerDPI();
                } else {
                    SweetAlert.swal({
                        title: "Lectura exitosa!",
                        text: "Los datos del DPI han sido leidos!",
                        type: "success",
                        confirmButtonColor: "#007AFF"
                    });
                }
            }
        };
        $scope.afterLeerDPI = null;
        $scope.leerHuella = function () {
            $scope.timeOutPush = 10000;
            $scope.busyMatching = true;
            $scope.onTimeoutCallBack = function () {
                $scope.busyMatching = false;
            };
            cfpLoadingBar.start();
            $scope.addAlert("info", "Coloque su dedo PULGAR DERECHO en el lector!");
            $scope.defCallBack = $scope.getHuellas;
            Query.get('http://localhost:4567/push-huella-read?cui=' + $scope.cui1, function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    $scope.busyMatching = false;
                    return;
                }
                $scope.getPushStatus(r.id);
            });
        };
        $scope.getHuellas = function (r) {
            $scope.busyMatching = true;
            $scope.timeOutPush = 25000;
            $scope.complete = false;
            cfpLoadingBar.start();
            $scope.addAlert("info", "Huellas listas!, cargando vista previa!");
            $scope.defCallBack = $scope.showHuellas;
            cfpLoadingBar.set(0.3);
            Query.get('http://localhost:4567/push-remote-huella-read?cui=' + $scope.cui1, function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    return;
                }
                $scope.getPushStatus(r.id);
            });
        };
        $scope.showHuellas = function (r) {
            $scope.busyMatching = false;
            cfpLoadingBar.complete();
            $scope.open('lg', r);
        };
        $scope.open = function (size, r) {
            var modalInstance = $modal.open({
                templateUrl: 'huellasModal.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return r;
                    }
                }
            });

            modalInstance.result.then(function () {
                $scope.matchHuella({valor: "Envio de huellas para verificacion..."});
            }, function () {
                $scope.addAlert("warning", "Comparacion de huellas cancelado!");
            });
        };
        $scope.cui1 = "";
        $scope.matchHuella = function (r) {
            $scope.complete = false;
            $scope.busyMatching = true;
            $scope.timeOutPush = 15000;
            cfpLoadingBar.start();
            $scope.addAlert("info", r.valor);
            $scope.defCallBack = $scope.parseMatchResult;
            Query.get('http://localhost:4567/push-huella-compare?cui=' + $scope.cui1, function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    return;
                }
                $scope.getPushStatus(r.id);
            });
        };
        $scope.parseMatchResult = function (r) {
            if (r.result <= 0) {
                SweetAlert.swal({
                    title: "Resultado de MOC",
                    text: "La huella no coincide con el CUI ingresado!",
                    type: "warning",
                    confirmButtonColor: "#007AFF"
                });
                return;
            }
            if (r.result > 0) {
                SweetAlert.swal({
                    title: "Resultado de MOC",
                    text: "La huella coincide con el CUI ingresado!",
                    type: "success",
                    confirmButtonColor: "#007AFF"
                });
                return;
            }
            $scope.addAlert("danger", "<strong>Error: No se ha podido determinar si la huella coincide!</strong>");
            $scope.busyMatching = false;
        };
        $scope.leerDPI_Huella = function () {
            $scope.busyMatching = true;
            $scope.afterLeerDPI = $scope.callBackAfterParseDPI;
            $scope.leerDPI();
        };
        $scope.buscaHuellaDPI=function(){
            $scope.callBackAfterParseDPI();
        };
        $scope.callBackAfterParseDPI = function () {
            SweetAlert.swal({
                title: "Lectura de Huella",
                text: "Presione en LEER HUELLA y coloque su pulgar DERECHO!",
                type: "success",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "LEER HUELLA"
            }, function (isConfirm) {
                if (isConfirm) {
//                    $scope.cui1 = $scope.persona.cui;
                    $scope.leerHuella();
                }
            });
        };
        $scope.cui2 = "";
        $scope.buscarOnline = function () {
            $scope.timeOutPush = 8000;
            $scope.busySearching = true;
            $scope.onTimeoutCallBack = function () {
                $scope.busySearching = false;
            };
            cfpLoadingBar.start();
            $scope.addAlert("info", "Coloque su dedo indice derecho en el lector!");
            $scope.addAlert("info", "Espere a que la luz cambie a roja!");
            $scope.defCallBack = $scope.parseOnlineRes;
            Query.get('http://localhost:4567/push-bio-search?cui=' + $scope.cui2, function (r, e) {
                if (e !== null) {
                    $scope.onError(e);
                    return;
                }
                $scope.getPushStatus(r.id);
            });
        };
        $scope.persona_rnp = {hit: false};
        $scope.parseOnlineRes = function (r) {
            $scope.busySearching = false;
            $scope.persona_rnp = r;
            $scope.noImage = false;
            if (!$scope.persona_rnp.hit) {
                SweetAlert.swal({
                    title: "Resultado",
                    text: "No se ha encontrado a la persona!",
                    type: "warning",
                    confirmButtonColor: "#007AFF"
                });
                return;
            }
            SweetAlert.swal({
                title: "Resultado",
                text: "Se encontraron datos para la persona!",
                type: "success",
                confirmButtonColor: "#007AFF"
            });
        };
    }]);


app.controller('ModalInstanceCtrl', ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {

        $scope.huellas = items;
        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
