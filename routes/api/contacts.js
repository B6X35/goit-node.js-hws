const express = require("express");

const { getAll, getById, add, remove, update, updateFavorite } = require("../../controlles/contacts");

const {authenticate} = require("../../middlewares")


const router = express.Router();

router.get("/", authenticate, getAll);

router.get("/:contactId", authenticate, getById);

router.post("/", authenticate, add);  

router.delete("/:contactId", authenticate, remove);

router.patch("/:id", authenticate, update);

router.patch("/:id/favorite", authenticate, updateFavorite);

module.exports = router;