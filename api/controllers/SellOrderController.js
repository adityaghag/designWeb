module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getCompleteSellList: function (req, res) {
        if (req.body) {
            SellOrder.getCompleteSellList(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid request"
                }
            });
        }
    },

    findAllSellOrders: function (req, res) {
        if (req.body) {
            SellOrder.findAllSellOrders(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid request"
                }
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);