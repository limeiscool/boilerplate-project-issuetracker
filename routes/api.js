"use strict";

const Project = require("../Models/Projects");
const mongoose = require("mongoose");
const connection = mongoose.connect(process.env.MONGO_URI);

module.exports = function (app) {
  const dateAutoGen = () => {
    return new Date().toISOString();
  };
  const filterIssues = (issues, query) => {
    const newIssues = issues.filter((obj) => {
      let result;
      for (let key in query) {
        if (obj[key] === query[key]) {
          result = true;
        } else {
          result = false;
          break;
        }
      }
      return result;
    });
    return newIssues;
  };

  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      let project = req.params.project;

      console.log(req.query);

      let ProjObj = await Project.findOne({ project_name: project });

      if (!ProjObj) {
        return res.status(404).json({ error: "project not found" });
      }
      let issues = ProjObj.issues;
      if (Object.keys(req.query).length === 0) {
        return res.json(issues);
      }
      let filteredIssues = filterIssues(issues, req.query);
      return res.json(filteredIssues);
    })

    .post(async (req, res) => {
      console.log("POST");
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.status(400).json({ error: "required field(s) missing" });
      }
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
        issue_title: issue.issue_title,
        issue_text: issue.issue_text,
        created_by: issue.created_by,
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
