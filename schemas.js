const Joi = require("joi");

const colorSchema = Joi.array().items(Joi.number().min(0).max(1)).length(4);

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
  applyToEntityTypes: Joi.array().items(Joi.string().required()).optional(),
});

const levelSchema = Joi.object({
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

const componentSchema = Joi.object({
  name: Joi.string().required(),
  metadata: Joi.any().required(),
});

const entitySchema = Joi.object({
  type: Joi.string().required(),
  components: Joi.array().items(componentSchema).required(),
});

const projectSchema = Joi.object({
  id: Joi.string().required(),
  version: Joi.number().required(),
  title: Joi.string().required(),
  background: colorSchema.required(),
  gravity: Joi.number().required(),
  defaultLevelId: Joi.string().required(),
  levels: Joi.array().items(levelSchema).required(),
  entities: Joi.array().items(entitySchema).required(),
  assets: Joi.object({
    sounds: Joi.array().items(
      Joi.object({
        src: Joi.string().required(),
        name: Joi.string().required(),
      }),
    ),
    sprites: Join.array().items(
      Join.object({
        src: Joi.string().required(),
        name: Joi.string().required(),
        tileWidth: Joi.number().required(),
        tileHeight: Joi.number().required(),
      }),
    ),
  }).required(),
});

module.exports = {
  projectSchema,
  levelSchema,
  spawnPointSchema,
};
