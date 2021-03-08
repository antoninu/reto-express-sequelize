var express = require("express");
var router = express.Router();
const db = require("../models");
const Joi = require("joi");
const WebSocket = require("ws");

/* GET all messages sent in the chat */
router.get("/messages", function (req, res, next) {
  return db.Message.findAll()
    .then((messages) => res.send(messages))
    .catch((err) => {
      console.log(
        "Ocurrió un error al consultar los mensajes",
        JSON.stringify(err)
      );
      return res.send(err);
    });
});

/* GET the message with the specified ts */
router.get("/messages/:ts", function (req, res, next) {
  const ts = req.params.ts;
  return db.Message.findOne({ where: { ts } })
    .then((message) => {
      if (!message) {
        return res
          .status(400)
          .send({ error: "A message with the specified TS does not exist." });
      }

      return res.send(message);
    })
    .catch((err) => {
      console.log(
        "Ocurrió un error al consultar los mensajes",
        JSON.stringify(err)
      );
      return res.send(err);
    });
});

let broadcastMessage = (clients, message) => {
  console.log(clients);
  clients.forEach((client) => client.send(JSON.stringify(message)));
};

/* POST create a new message */
router.post("/messages", function (req, res, next) {
  const { error } = validateMessage(req.body);

  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const { message, author, ts } = req.body;

  //enviar a todos los clientes para que cuando se cree un mensaje desde la API
  //se actualice la interfaz de todos
  broadcastMessage(req.ws.clients, req.body);

  //send the new message in the ws
  //wsConnection.sendMessages("holi");

  //save the new message
  db.Message.create({ message, author, ts })
    .then((message) => res.status(201).send({ message }))
    .catch((err) => {
      console.log(
        "There was an error creating the message.",
        JSON.stringify(contact)
      );
      return res.status(400).send({ error: err });
    });
});

/* PUT update a message given the ts */
router.put("/messages/:ts", function (req, res, next) {
  const { error } = validateUpdateMessage(req.body);

  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const ts = req.params.ts;
  return db.Message.findOne({ where: { ts } }).then((mes) => {
    const { message, author } = req.body;
    if (!mes) {
      return res
        .status(400)
        .send({ error: "A message with the specified TS does not exist." });
    }
    return mes
      .update({ message, author })
      .then(() => res.send({ mes }))
      .catch((err) => {
        console.log(
          "There was an error updating the message.",
          JSON.stringify(err)
        );
        res.status(400).send(err);
      });
  });
});

/* DELETE delete a message given the ts */
router.delete("/messages/:ts", function (req, res, next) {
  const ts = req.params.ts;
  return db.Message.findOne({ where: { ts } }).then((mes) => {
    if (!mes) {
      return res
        .status(400)
        .send({ error: "A message with the specified TS does not exist." });
    }
    return mes
      .destroy({ force: true })
      .then(() => res.status(204).send())
      .catch((err) => {
        console.log(
          "There was an error deleting the message.",
          JSON.stringify(err)
        );
        res.status(400).send(err);
      });
  });
});

function validateMessage(message) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .regex(RegExp(/^\w+(?:\s\w+)$/))
      .required(),
    ts: Joi.number().required(),
  });

  return schema.validate(message);
}

function validateUpdateMessage(message) {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string()
      .regex(RegExp(/^\w+(?:\s\w+)$/))
      .required(),
  });

  return schema.validate(message);
}

module.exports = router;
