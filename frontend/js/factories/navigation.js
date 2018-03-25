myApp.factory('NavigationService', function ($http) {
    var navigation = [{
        name: "Home",
        classis: "active",
        anchor: "home",
        subnav: [{
            name: "Subnav1",
            classis: "active",
            anchor: "home"
        }]
    }, {
        name: "Links",
        classis: "active",
        anchor: "links",
        subnav: []
    }];

    return {
        getNavigation: function () {
            return navigation;
        },
        callApiWithData: function (url, data, callback) {
            $http.post(adminurl + url, data).then(function (data) {
                callback(data);
            });
        },
        apiCallWithoutData: function (url, callback) {
            $http.post(adminurl + url).then(function (data) {
                if (data) {
                    data = data.data;
                    callback(data);
                }
            });
        },

    };
});