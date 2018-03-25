module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getCompleteTransactionList: function (req, res) {
        if (req.body) {
            Transaction.getCompleteTransactionList(req.body, res.callback);

        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid request"
                }
            });
        }
    },
    getUserTransactionList: function (req, res) {

        if (req.body) {
            Transaction.getUserTransactionList(req.body, res.callback);

        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    
};
module.exports = _.assign(module.exports, controller);
