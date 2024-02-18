"use strict";
const { nanoid } = require("nanoid");
const Issue = require("../models/issue");

module.exports = function (app) {
  const testIssues = [];
  const dateAutoGen = () => {
    return new Date().toISOString();
  };

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(function (req, res) {
      let project = req.params.project;
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
