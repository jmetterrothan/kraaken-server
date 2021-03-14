const Joi = require("joi");

const levelSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  background: Joi.object({
    r: Joi.number(),
    g: Joi.number(),
    b: Joi.number(),
    a: Joi.number(),
  }).required(),
  gravity: Joi.number().required(),
  defaultRoomId: Joi.string().required(),
});

const spawnPointSchema = Joi.object({
  type: Joi.string().required(),
  uuid: Joi.string().required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
  }),
  direction: {
    x: Joi.number().valid(1, -1).required(),
    y: Joi.number().valid(1, -1).required(),
  },
  debug: Joi.boolean().required(),
});

const roomSchema = Joi.object({
  id: Joi.string().required(),
  tileSet: Joi.string().required(),
  tileSize: Joi.number().required(),
  tileMapCols: Joi.number().required(),
  tileMapRows: Joi.number().required(),
  layers: Joi.object({
    1: Joi.array().items(Joi.number()).required(),
    2: Joi.array().items(Joi.number()).required(),
    3: Joi.array().items(Joi.number()).required(),
  }).required(),
  spawnPoints: Joi.array()
    .items(spawnPointSchema)
    .required()
    .unique((a, b) => a.uuid === b.uuid),
});

module.exports = {
  levelSchema,
  roomSchema,
  spawnPointSchema,
};
