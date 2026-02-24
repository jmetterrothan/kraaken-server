const Joi = require("joi");

const colorSchema = Joi.array().items(Joi.number().min(0).max(1)).length(4);

const gameEventSchema = Joi.object({
  type: Joi.string().required(),
  data: Joi.any().required(),
});

const eventZoneMetadataSchema = Joi.object({
  mode: Joi.string().valid("contains", "intersects").optional(),
  cooldownDelay: Joi.number().optional(),
  maxTimesTriggered: Joi.number().optional(),
  shouldTriggerWhileActive: Joi.boolean().optional(),
  events: Joi.array().items(gameEventSchema).optional(),
  applyToEntityTypes: Joi.array().items(Joi.string().required()).optional(),
});

const positionMetadata = Joi.object({
  x: Joi.number().optional(),
  y: Joi.number().optional(),
});

const boundingBoxMetadata = Joi.object({
  width: Joi.number().optional(),
  height: Joi.number().optional(),
  color: colorSchema.optional(),
  debug: Joi.boolean().optional(),
});

const rigidBodyMetadata = Joi.object({
  direction: {
    x: Joi.number().valid(1, -1).optional(),
    y: Joi.number().valid(1, -1).optional(),
  },
});

const componentMetadataSchema = Joi.object({
  position: positionMetadata.optional(),
  rigid_body: rigidBodyMetadata.optional(),
  bounding_box: boundingBoxMetadata.optional(),
  event_zone: eventZoneMetadataSchema.optional(),
});

const spawnPointSchema = Joi.object({
  type: Joi.string().required(),
  uuid: Joi.string().required(),
  components: componentMetadataSchema.required(),
});

const layerSchema = Joi.object({
  tileSet: Joi.string().required(),
  visible: Joi.boolean().required(),
  data: Joi.array().items(Joi.number()).required(),
});

const levelSchema = Joi.object({
  id: Joi.string().required(),
  tileSize: Joi.number().required(),
  tileMapCols: Joi.number().required(),
  tileMapRows: Joi.number().required(),
  background: colorSchema.required(),
  gravity: Joi.number().required(),
  layers: Joi.object({
    1: layerSchema.required(),
    2: layerSchema.required(),
    3: layerSchema.required(),
  }).required(),
  spawnPoints: Joi.array()
    .items(spawnPointSchema)
    .required()
    .unique((a, b) => a.uuid === b.uuid),
});

const componentSchema = Joi.object({
  name: Joi.string().required(),
  metadata: Joi.any().optional().default({}),
});

const entitySchema = Joi.object({
  type: Joi.string().required(),
  components: Joi.array().items(componentSchema).required(),
});

const projectSchema = Joi.object({
  id: Joi.string().required(),
  version: Joi.number().required(),
  title: Joi.string().required(),
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
    sprites: Joi.array().items(
      Joi.object({
        src: Joi.string().required(),
        name: Joi.string().required(),
        tileWidth: Joi.number().required(),
        tileHeight: Joi.number().required(),
        defaultTileIndex: Joi.number().allow(null).required(),
      }),
    ),
  }).required(),
});

module.exports = {
  projectSchema,
  levelSchema,
  spawnPointSchema,
};
