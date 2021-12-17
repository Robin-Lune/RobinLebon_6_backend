const express = require("express");
const router = express.Router();
const sauceCtrl = require ('../controllers/sauce');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config')

router.get("/", auth, sauceCtrl.getAllSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);



module.exports = router;