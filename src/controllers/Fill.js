const models = require('../models');
const mongoose = require('mongoose');

const fillPage = (req, res) => {
  res.render('fill', { csrfToken: req.csrfToken() });
};

const outlinePage = (req, res) => {
  res.render('outline', { csrfToken: req.csrfToken() });
};

const Draw = models.Draw;

const templatesPage = (req, res) => {
  Draw.DrawModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.render('templates', { csrfToken: req.csrfToken(), draws: docs });
  });
};

const saveDraw = (req, res) => {
  const drawData = {
    calls: req.body.calls,
    owner: req.session.account._id,
  };

  const newDraw = new Draw.DrawModel(drawData);

  return newDraw.save((err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    return res.json({ redirect: '/templates' });
  });
};

const removeDraw = (req, res) => {
  const convertId = mongoose.Types.ObjectId;
  Draw.DrawModel.find({
    _id: req.params.id,
    owner: convertId(req.session.account._id) }).remove().exec((err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occured' });
      }
      return res.json({ redirect: '/templates' });
    });
};

const selectDraw = (req, res) => {
  Draw.DrawModel.find({
    _id: req.params.id,
  }).select('calls').exec((err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('fill', { draws: docs, csrfToken: req.csrfToken() }, (error, html) => {
      if (error) { console.log(error); }
      res.status(200).send(html);
    });
  });
};

module.exports.fillPage = fillPage;
module.exports.outlinePage = outlinePage;
module.exports.templatesPage = templatesPage;
module.exports.save = saveDraw;
module.exports.remove = removeDraw;
module.exports.select = selectDraw;
