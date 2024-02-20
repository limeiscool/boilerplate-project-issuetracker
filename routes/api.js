"use strict";

const Project = require("../Models/Projects");
const mongoose = require("mongoose");
const connection = mongoose.connect(process.env.MONGO_URI);

module.exports = function (app) {
  const dateAutoGen = () => {
    return new Date().toISOString();
  };

  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let ProjObj = Project.findOne({ project_name: project });
      ProjObj.then(async (data) => {
        if (data == null) {
          const newProject = new Project({
            project_name: project,
            issues: [],
          });
          await newProject.save();
          res.json(newProject.issues);
        } else {
          res.json(data.issues);
        }
      });
    })

    .post(async (req, res) => {
      let project = req.params.project;
      let issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: dateAutoGen(),
        updated_on: dateAutoGen(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        open: true,
      };
      await Project.updateOne(
        { project_name: project },
        { $push: { issues: issue } },
        { upsert: true }
      );
      // get id for res
      const currentProject = await Project.findOne({ project_name: project });
      const id = currentProject.issues[currentProject.issues.length - 1]._id;
      res.json({
        assigned_to: issue.assigned_to,
        status_text: issue.status_text,
        open: issue.open,
        _id: id,
        created_on: issue.created_on,
        updated_on: issue.updated_on,
      });
    })

    .put(async (req, res) => {
      let project = req.params.project;
      const issueID = req.body._id;
      const currentProject = await Project.findOne(
        { project_name: project },
        { issues: { $elemMatch: { _id: issueID } } }
      );
      console.log(currentProject.issues[0]);
      const currentIssue = currentProject.issues[0];

      const Doc = await Project.findOneAndUpdate(
        { project_name: project, "issues._id": issueID },
        {
          $set: {
            "issues.$.issue_title":
              req.body.issue_title || currentIssue.issue_title,
            "issues.$.issue_text":
              req.body.issue_text || currentIssue.issue_text,
            "issues.$.created_by":
              req.body.created_by || currentIssue.created_by,
            "issues.$.updated_on": dateAutoGen(),
            "issues.$.assigned_to":
              req.body.assigned_to || currentIssue.assigned_to,
            "issues.$.status_text":
              req.body.status_text || currentIssue.status_text,
            "issues.$.open": req.body.open || currentIssue.open,
          },
        }
      ).then(async (data) => {
        if (data == null) {
          res.json({ error: "Issue not found" });
        } else {
          res.json({
            result: "updated successfully",
            _id: data.issues[0]._id,
          });
        }
      });
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
