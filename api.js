const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nocache = require("nocache");

const schemas = require("./schemas");

const api = express();

api.use(nocache());
api.use(cors({ origin: "*" }));
api.use(bodyParser.json());
api.use("/levels", express.static("levels"));

api.get("/", function (req, res) {
  const { version } = require("./package.json");
  res.status(200).send(`Welcome to the kraaken API ${version}`);
});

const isDir = (path) => fs.lstatSync(path).isDirectory();

api.get("/levels", function (req, res) {
  const levelsPath = path.join(__dirname, `levels`);

  const levels = fs.readdirSync(levelsPath).reduce((acc, id) => {
    const levelPath = path.join(levelsPath, id, `level.json`);

    if (fs.existsSync(levelPath)) {
      const levelData = JSON.parse(fs.readFileSync(levelPath));

      if (isDir(path.join(levelsPath, id))) {
        acc.push({ id: levelData.id, title: levelData.title });
      }
    }
    return acc;
  }, []);

  res.status(200).json(levels);
});

api.get("/levels/:levelId", function (req, res) {
  const { levelId } = req.params;

  const levelsPath = path.join(__dirname, `levels`);

  const levelPath = path.join(levelsPath, levelId, `level.json`);

  if (!fs.existsSync(levelPath)) {
    res.status(404).json({
      error: `Could not find level "${levelId}"`,
    });
    return;
  }

  const entitiesPath = path.join(levelsPath, levelId, `entities.json`);
  const resourcesPath = path.join(levelsPath, levelId, `resources.json`);
  const roomsPath = path.join(levelsPath, levelId, `rooms`);

  const rooms = fs.readdirSync(roomsPath).reduce((acc, id) => {
    if (id.endsWith(".save.json")) {
      return acc;
    }

    const roomPath = path.join(roomsPath, id);

    if (fs.existsSync(roomPath) && !isDir(roomPath)) {
      const room = JSON.parse(fs.readFileSync(roomPath));

      acc.push({ id: id.replace(".json", ""), ...room });
    }
    return acc;
  }, []);

  try {
    res.status(200).json({
      id: levelId,
      ...JSON.parse(fs.readFileSync(levelPath)),
      rooms,
      entities: JSON.parse(fs.readFileSync(entitiesPath)),
      resources: JSON.parse(fs.readFileSync(resourcesPath)),
    });
  } catch (e) {
    res.status(500).json({
      error: `Could not save level "${levelId}" data`,
    });
  }
});

api.post("/levels/:levelId", function (req, res) {
  const { levelId } = req.params;

  const levelsPath = path.join(__dirname, `levels`);
  const levelPath = path.join(levelsPath, levelId, `level.json`);
  const levelCopyPath = path.join(levelsPath, levelId, `level.save.json`);

  if (!fs.existsSync(levelPath)) {
    res.status(404).json({
      error: `Could not find level "${levelId}"`,
    });
    return;
  }

  const { value, error } = schemas.levelSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      error: `Could not validate level "${levelId}" data`,
      validation: error.details,
    });
    return;
  }

  try {
    if (process.env.SAVE_COPY === "true")
      fs.copyFileSync(levelPath, levelCopyPath);
    fs.writeFileSync(levelPath, JSON.stringify(value, null, 2));

    res.status(200).json();
  } catch (e) {
    res.status(500).json({
      error: `Could not save level "${levelId}" data`,
    });
  }
});

api.post("/levels/:levelId/rooms/:roomId", function (req, res) {
  const { levelId, roomId } = req.params;

  const roomsPath = path.join(__dirname, `levels`, levelId, "rooms");

  const roomPath = path.join(roomsPath, `${roomId}.json`);
  const roomCopyPath = path.join(roomsPath, `${roomId}.save.json`);

  if (!fs.existsSync(roomPath)) {
    res.status(404).json({
      error: `Could not find room "${roomId}" for level "${levelId}"`,
    });
    return;
  }

  const { value, error } = schemas.roomSchema.validate(req.body);

  if (error) {
    res.status(400).json({
      error: `Could not validate room "${roomId}" data for "${levelId}"`,
      validation: error.details,
    });
    return;
  }

  try {
    if (process.env.SAVE_COPY === "true")
      fs.copyFileSync(roomPath, roomCopyPath);
    fs.writeFileSync(roomPath, JSON.stringify(value, null, 2));

    res.status(200).json();
  } catch (e) {
    res.status(500).json({
      error: `Could not save room "${roomId}" data for level "${levelId}"`,
    });
  }
});

module.exports = api;
