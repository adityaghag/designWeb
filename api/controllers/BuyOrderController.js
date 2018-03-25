module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    findAllBuyOrders: function (req, res) {
        if (req.body) {
            BuyOrder.findAllBuyOrders(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    getCompleteBuyList: function (req, res) {
        if (req.body) {
            BuyOrder.getCompleteBuyList(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },

    getUserList: function (req, res) {
        if (req.body) {
            BuyOrder.getUserList(req.body, res.callback);
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