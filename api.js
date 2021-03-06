const fs = require("fs");
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

api.get("/levels/:levelId", function (req, res) {
  const { levelId } = req.params;

  const levelPath = `${__dirname}\\levels\\${levelId}\\level.json`;
  const entitiesPath = `${__dirname}\\levels\\${levelId}\\entities.json`;
  const resourcesPath = `${__dirname}\\levels\\${levelId}\\resources.json`;

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
  const path = `${__dirname}\\levels\\${levelId}\\level.json`;

  if (!fs.existsSync(path)) {
    res.status(404).json({
      error: `Could not find level "${levelId}"`,
    });
  } else {
    try {
      fs.writeFileSync(path, JSON.stringify(req.body, null, 2));
      res.status(200).json();
    } catch (e) {
      res.status(400).json({
        error: `Could not save level "${levelId}" data`,
      });
    }
  }
});

module.exports = api;
