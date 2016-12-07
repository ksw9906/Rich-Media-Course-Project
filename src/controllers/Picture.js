const models = require('../models');
const mongoose = require('mongoose');

const Picture = models.Picture;

const galleryPage = (req, res) => {
  Picture.PictureModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.render('gallery', { csrfToken: req.csrfToken(), pictures: docs });
  });
};

const savePicture = (req, res) => {
  const PictureData = {
    dataString: req.body.dataString,
    owner: req.session.account._id,
  };

  const newPicture = new Picture.PictureModel(PictureData);

  return newPicture.save((err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return Picture.PictureModel.findByOwner(req.session.account._id, (er, docs) => {
      if (er) {
        console.log(er);
        return res.status(400).json({ error: 'An error occured' });
      }

      return res.render('gallery', { csrfToken: req.csrfToken(), pictures: docs }, (error, html) => {
        if (error) { console.log(error); }
        res.status(200).send(html);
      });
    });
  });
};

const removePicture = (req, res) => {
  const convertId = mongoose.Types.ObjectId;
  Picture.PictureModel.find({
    _id: req.params.id,
    owner: convertId(req.session.account._id) }).remove().exec((err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occured' });
      }
      return res.json({ redirect: '/gallery' });
    });
};

module.exports.galleryPage = galleryPage;
module.exports.save = savePicture;
module.exports.remove = removePicture;
