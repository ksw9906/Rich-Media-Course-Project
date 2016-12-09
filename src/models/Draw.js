const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let DrawModel = {};

// mongoose.Types.ObjectID is a function that converts
// string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;

const DrawSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  calls: {
    type: Array,
    required: true,
  },
});

DrawSchema.statics.toAPI = doc => ({
  calls: doc.calls,
});

DrawSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DrawModel.find(search).select('calls').exec(callback);
};

DrawModel = mongoose.model('Draw', DrawSchema);

module.exports.DrawModel = DrawModel;
module.exports.DrawSchema = DrawSchema;
