var schema = new Schema({
    name: {
        type: String,
        required: true,
        excel: true
        
    },
    shortName: {
        type: String,
        required: true,
        excel: true
        
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Script', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);