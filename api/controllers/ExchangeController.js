module.exports = _.cloneDeep(require("sails-wohlig-controller"));

var controller = {

    exchangeBTK: function (req, res) {
        if (req.body) {
            Exchange.exchangeBTK(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },

    saveOrdersData: function (req, res) {
        if (req.body) {
            Exchange.saveOrdersData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },

    getArrData: function (req, res) {
        if (req.body) {
            Exchange.getArrData(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    }

};
module.exports = _.assign(module.exports, controller);