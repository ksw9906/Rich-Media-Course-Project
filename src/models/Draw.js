const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let DrawModel = {};

// mongoose.Types.ObjectID is a function that converts
// string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setName = name => _.escape(name).trim();

const DrawSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
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
  name: doc.name,
  calls: doc.calls,
});

DrawSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return DrawModel.find(search).select('name calls').exec(callback);
};

DrawModel = mongoose.model('Draw', DrawSchema);

module.exports.DrawModel = DrawModel;
module.exports.DrawSchema = DrawSchema;
