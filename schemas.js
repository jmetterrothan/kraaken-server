const Joi = require("joi");

const colorSchema = Joi.array().items(Joi.number().min(0).max(1)).length(4);

const levelSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().required(),
  background: colorSchema.required(),
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

const gameEventSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.any().required(),
});

const eventZoneSchema = Joi.object({
  mode: Joi.string().valid("contains", "intersects").required(),
  debug: Joi.boolean().required(),
  position: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
  }),
  width: Joi.number().required(),
  height: Joi.number().required(),
  color: colorSchema.required(),
  cooldownDelay: Joi.number().required(),
  maxTimesTriggered: Joi.number().required(),
  shouldTriggerWhileActive: Joi.boolean().required(),
  events: Joi.array().items(gameEventSchema).required(),
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
  zones: Joi.array().items(eventZoneSchema).required(),
});

module.exports = {
  levelSchema,
  roomSchema,
  spawnPointSchema,
};
