const express = require("express");
const router = express.Router();

const uploadController = require("../controller/upload.controller");
const { upload } = require("../middlewares/upload");

router.post("/upload", upload.single("picture"), uploadController.uploadFile);

module.exports = router;
