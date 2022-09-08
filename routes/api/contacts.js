const Contact = require("../../models/contact");

const express = require("express");
const Joi = require('joi')

const router = express.Router();


const {requestError} = require("../../helpers")

const contactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required()
});

router.get("/", async (req, res, next) => {
  try{
    const result = await Contact.find();
  res.json(result);
  } catch(error) {
    next(error)
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      throw requestError(404, "Not found");
    }
    res.json(result);
  } catch(error) {
    next(error)
  }
   
});

router.post("/", async (req, res, next) => {
  try {
    const {error} = contactSchema.validate(req.body);
    if(error) {
      throw requestError(400, "missing required name field");
    };
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch(error) {
    next(error)
  }
});  

router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params; 
    const result = await Contact.findByIdAndRemove(contactId);
    if (!result) {
      throw requestError(404, "Not found");
    }
    res.json({"message": "contact deleted"})
  } catch (error){
    next(error)
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Contact.findByIdAndUpdate({_id: id}, req.body);
    if (!result) {
      throw requestError(404, "Not found");
    }
    res.json(result);
  } catch(error) {
    next(error);
  }
});

router.patch("/:id/favorite", async (req, res, next) => {

  try {
    const { id } = req.params;
    if (!req.body) {
      throw requestError(400, "missing field favorite");
    }
    const { favorite } = req.body; 
    const result = await Contact.findByIdAndUpdate({_id: id}, {favorite: favorite});
    if (!result) {
      throw requestError(404, "Not found");
    }
    res.json(result);
  } catch(error) {
    next(error);
  }
});

module.exports = router;
