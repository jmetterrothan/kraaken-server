const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nocache = require("nocache");

const schemas = require("./schemas");

const api = express();

const projectsPath = path.join(__dirname, `projects`);

api.use(nocache());
api.use(cors({ origin: "*" }));
api.use(bodyParser.json());
api.use("/projects", express.static(projectsPath));

api.get("/", function (req, res) {
  const { version } = require("./package.json");
  res.status(200).send(`Welcome to the kraaken API ${version}`);
});

const isDir = (path) => fs.lstatSync(path).isDirectory();

const PROJECT_ID_REGEXP = /^[a-zA-Z0-9_-]+$/;

api.get("/projects", function (req, res) {
  try {
    const projects = fs.readdirSync(projectsPath).reduce((acc, id) => {
      const projectPath = path.join(projectsPath, id, `data.json`);

      if (fs.existsSync(projectPath)) {
        const projectData = JSON.parse(fs.readFileSync(projectPath));

        if (isDir(path.join(projectsPath, id))) {
          acc.push({ id: projectData.id, title: projectData.title });
        }
      }
      return acc;
    }, []);

    res.status(200).json(projects);
  } catch (e) {
    res.status(500).json({
      error: `Could not recover projects`,
    });
  }
});

api.get("/projects/:projectId", function (req, res) {
  const { projectId } = req.params;

  if (!PROJECT_ID_REGEXP.test(projectId)) {
    res.status(400).json({
      error: `Invalid project id "${projectId}"`,
    });
    return;
  }

  const projectPath = path.join(projectsPath, projectId, `data.json`);

  try {
    if (!fs.existsSync(projectPath)) {
      res.status(404).json({
        error: `Could not find project "${projectId}"`,
      });
      return;
    }

    res.status(200).json(JSON.parse(fs.readFileSync(projectPath)));
  } catch (e) {
    res.status(500).json({
      error: `Could not recover project "${projectId}" data`,
    });
  }
});

api.post("/projects/:projectId", function (req, res) {
  const { projectId } = req.params;

  if (!PROJECT_ID_REGEXP.test(projectId)) {
    res.status(400).json({
      error: `Invalid project id "${projectId}"`,
    });
    return;
  }

  const projectPath = path.join(projectsPath, projectId, `data.json`);
  const projectCopyPath = path.join(projectsPath, projectId, `data.save.json`);

  try {
    if (!fs.existsSync(projectPath)) {
      res.status(404).json({
        error: `Could not find project "${projectId}"`,
      });
      return;
    }

    const projectData = JSON.parse(fs.readFileSync(projectPath));

    const { value, error } = schemas.projectSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        error: `Could not validate project "${projectId}" data`,
        validation: error.details,
      });
      return;
    }

    if (value.version !== projectData.version) {
      res.status(409).json({
        error: `Version mismatch for project "${projectId}"`,
      });
      return;
    }

    if (process.env.SAVE_COPY === "true") {
      fs.copyFileSync(projectPath, projectCopyPath);
    }

    const updatedLevelData = { ...value, version: value.version + 1 };
    fs.writeFileSync(projectPath, JSON.stringify(updatedLevelData, null, 2));

    res.status(200).json(updatedLevelData);
  } catch (e) {
    res.status(500).json({
      error: `Could not save project "${projectId}" data`,
    });
  }
});

module.exports = api;
