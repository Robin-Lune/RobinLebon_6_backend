const fs = require("fs");
const Sauce = require("../models/Sauce");

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré!" }))
    .catch((error) => res.status(400).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  console.log(req.body);
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: new Error("Sauce non trouvé!") });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({
          error: new Error("Requête non autorisée !"),
        });
      }
      let sauceObject = req.body;
      const sauceFile = req.file;
        if (sauceFile) {
          sauceObjet = JSON.parse(req.body.sauce);
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, (err) => {
            if (err) throw err;
            console.log('ancienne image supprimée');
          });
          sauceObject.imageUrl = `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`;
        };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifié!" }))
    .catch((error) => res.status(400).json({ error }));
  })
  .catch((error) => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: new Error("Sauce non trouvé!") });
      }
      if (sauce.userId !== req.auth.userId) {
        return res.status(401).json({
          error: new Error("Requête non autorisée !"),
        });
      }
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (!sauce) {
        return res.status(404).json({ error: new Error("Sauce non trouvé!") });
      }
      let like = req.body.like;
      let userId = req.body.userId;
      let sauceId = req.params.id;

      switch (like) {
        case 1:
          if (sauce.usersLiked.includes(req.auth.userId)) {
            return res.status(401).json({
              error: new Error("Vous avez déjà liké cette sauce !"),
            });
          }
          Sauce.updateOne(
            { _id: sauceId },
            { $push: { usersLiked: userId }, $inc: { likes: +1 } }
          )
            .then(() => res.status(200).json({ message: `J'aime` }))
            .catch((error) => res.status(400).json({ error }));

          break;

        case 0:
          Sauce.findOne({ _id: sauceId })
            .then((sauce) => {
              if (sauce.usersLiked.includes(userId)) {
                Sauce.updateOne(
                  { _id: sauceId },
                  { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                )
                  .then(() => res.status(200).json({ message: `Neutre` }))
                  .catch((error) => res.status(400).json({ error }));
              }
              if (sauce.usersDisliked.includes(userId)) {
                Sauce.updateOne(
                  { _id: sauceId },
                  { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
                )
                  .then(() => res.status(200).json({ message: `Neutre` }))
                  .catch((error) => res.status(400).json({ error }));
              }
            })
            .catch((error) => res.status(404).json({ error }));
          break;

        case -1:
          if (sauce.usersDisliked.includes(req.auth.userId)) {
            return res.status(401).json({
              error: new Error("Vous avez déjà disliké cette sauce !"),
            });
          }
          Sauce.updateOne(
            { _id: sauceId },
            { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
          )
            .then(() => {
              res.status(200).json({ message: `Je n'aime pas` });
            })
            .catch((error) => res.status(400).json({ error }));
          break;

        default:
          console.log(error);
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
