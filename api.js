const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nocache = require("nocache");

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
        acc.push({ id, title: levelData.title });
      }
    }
    return acc;
  }, []);

  res.status(200).json(levels);
});

api.get("/levels/:levelId", function (req, res) {
  const { levelId } = req.params;

  const levelsPath = `${__dirname}\\levels`;

  const levelPath = path.join(levelsPath, levelId, `level.json`);
  const entitiesPath = path.join(levelsPath, levelId, `entities.json`);
  const resourcesPath = path.join(levelsPath, levelId, `resources.json`);

  if (!fs.existsSync(levelPath)) {
    res.status(404).json({
      error: `Could not find level "${levelId}"`,
    });
  } else {
    try {
      res.status(200).json({
        level: JSON.parse(fs.readFileSync(levelPath)),
        entities: JSON.parse(fs.readFileSync(entitiesPath)),
        resources: JSON.parse(fs.readFileSync(resourcesPath)),
      });
    } catch (e) {
      res.status(400).json({
        error: `Could not save level "${levelId}" data`,
      });
    }
  }
});

api.post("/levels/:levelId", function (req, res) {
  const { levelId } = req.params;

  const levelsPath = `${__dirname}\\levels`;
  const levelPath = path.join(levelsPath, levelId, `level.json`);

  if (!fs.existsSync(levelPath)) {
    res.status(404).json({
      error: `Could not find level "${levelId}"`,
    });
  } else {
    try {
      fs.writeFileSync(levelPath, JSON.stringify(req.body, null, 2));
      res.status(200).json();
    } catch (e) {
      res.status(400).json({
        error: `Could not save level "${levelId}" data`,
      });
    }
  }
});

module.exports = api;
