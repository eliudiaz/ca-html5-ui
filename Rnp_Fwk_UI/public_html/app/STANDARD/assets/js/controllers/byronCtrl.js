'use strict';
/** 
  * controller for User Profile Example
*/
var data = [{
    id: 1,
    name: "Batman",
    alias: "Bruce Wayne",
    publisher: "DC Comics",
    gender: "male",
    power: 37
}, {
    id: 2,
    name: "Superman",
    alias: "Clark Kent",
    publisher: "DC Comics",
    gender: "male",
    power: 94
}, {
    id: 3,
    name: "Catwoman",
    alias: "Selina Kyle",
    publisher: "DC Comics",
    gender: "female",
    power: 24
}, {
    id: 4,
    name: "Spider-Man",
    alias: "Peter Benjamin Parker",
    publisher: "Marvel Comics",
    gender: "male",
    power: 58
}, {
    id: 5,
    name: "Banshee",
    alias: "Sean Cassidy",
    publisher: "Marvel Comics",
    gender: "male",
    power: 60
}, {
    id: 6,
    name: "Black Mamba",
    alias: "Tanya Sealy",
    publisher: "Marvel Comics",
    gender: "female",
    power: 78
}, {
    id: 7,
    name: "Batgirl",
    alias: "Mary Elizabeth Kane",
    publisher: "DC Comics",
    gender: "female",
    power: 12
}, {
    id: 8,
    name: "Blade",
    alias: "Eric Brooks",
    publisher: "Marvel Comics",
    gender: "male",
    power: 33
}, {
    id: 9,
    name: "Captain America",
    alias: "Steven Grant Rogers",
    publisher: "Marvel Comics",
    gender: "male",
    power: 46
}, {
    id: 10,
    name: "Lex Luthor",
    alias: "Alexander 'Lex' Joseph Luthor",
    publisher: "DC Comics",
    gender: "male",
    power: 10
}, {
    id: 11,
    name: "Marvel Girl",
    alias: "Rachel Anne Summers",
    publisher: "Marvel Comics",
    gender: "female",
    power: 95
}, {
    id: 12,
    name: "Penguin",
    alias: "Oswald Chesterfield Cobblepot",
    publisher: "DC Comics",
    gender: "male",
    power: 30
}, {
    id: 13,
    name: "Rogue",
    alias: "Anna Marie",
    publisher: "Marvel Comics",
    gender: "female",
    power: 80
}];

app.controller('byronCtrl', ["$scope", "ngTableParams","Query", function ($scope, ngTableParams,Query) {
    $scope.titulo="Mantenimiento de Usuarios";
    $scope.descripcion="Ayuda: desde esta pagina puede agregar, eliminar y modificar los datos de los usaurios del sistema."
    $scope.tableParams = new ngTableParams({
        page: 1, // show first page
        count: 5 // count per page
    }, {
        total: data.length, // length of data
        getData: function ($defer, params) {
            $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
}]);