const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const _ = require('underscore');

let PictureModel = {};

// mongoose.Types.ObjectID is a function that converts
// string ID to real mongo ID
const convertId = mongoose.Types.ObjectId;
const setDataString = dataString => _.escape(dataString).trim();

const PictureSchema = new mongoose.Schema({
  dataString: {
    type: String,
    required: true,
    trim: true,
    set: setDataString,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
});

PictureSchema.statics.toAPI = doc => ({
  dataString: doc.dataString,
});

PictureSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return PictureModel.find(search).select('dataString').exec(callback);
};

PictureModel = mongoose.model('Picture', PictureSchema);

module.exports.PictureModel = PictureModel;
module.exports.PictureSchema = PictureSchema;
