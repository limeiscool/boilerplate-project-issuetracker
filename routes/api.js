"use strict";

const Project = require("../Models/Projects");
const mongoose = require("mongoose");
const connection = mongoose.connect(process.env.MONGO_URI);

module.exports = function (app) {
  const dateAutoGen = () => {
    return new Date();
  };
  const filterIssues = (issues, query) => {
    const newIssues = issues.filter((obj) => {
      let result;
      for (let key in query) {
        if (key === "_id") {
          if (obj[key].toString() === query[key]) {
            result = true;
          }
        } else if (obj[key] === query[key]) {
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
  const findIssue = async (project, id) => {
    const query = Project.where({ project_name: project });
    const projectObj = await query.findOne();
    const issues = projectObj.issues;
    const currentIssue = issues.filter((obj) => obj._id.toString() === id)[0];
    if (!currentIssue) {
      return null;
    } else {
      return currentIssue;
    }
  };

  app
    .route("/api/issues/:project")

    .get(async (req, res) => {
      let project = req.params.project;

      let ProjObj = await Project.findOne({ project_name: project });

      if (!ProjObj) {
        return res.status(404).json({ error: "project not found" });
      }
      let issues = ProjObj.issues;
      if (Object.keys(req.query).length === 0) {
        return res.status(200).json(issues);
      }
      let filteredIssues = filterIssues(issues, req.query);
      return res.status(200).json(filteredIssues);
    })

    .post(async (req, res) => {
      let reqObj = req.body;
      const checkKeys = ["issue_title", "issue_text", "created_by"];
      let reqEmpty = false;
      for (let each of checkKeys) {
        if (reqObj[each] === "" || !reqObj[each]) {
          reqEmpty = true;
          break;
        }
      }
      if (reqEmpty === true) {
        return res.status(202).json({ error: "required field(s) missing" });
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
      res.status(200).json({
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
      if (req.body._id === "" || !req.body._id) {
        return res.status(202).json({ error: "missing _id" });
      }
      let updateFeilds =
        req.body.issue_title ||
        req.body.issue_text ||
        req.body.created_by ||
        req.body.assigned_to ||
        req.body.status_text ||
        req.body.open;
      if (updateFeilds === "" || !updateFeilds) {
        return res
          .status(202)
          .json({ error: "no update field(s) sent", _id: req.body._id });
      }
      let foundIssue = await findIssue(project, req.body._id);
      if (!foundIssue) {
        return res
          .status(202)
          .json({ error: "could not update", _id: req.body._id });
      }
      const filter = { "issues._id": req.body._id };
      const update = {
        $set: {
          "issues.$.issue_title":
            req.body.issue_title || foundIssue.issue_title,
          "issues.$.issue_text": req.body.issue_text || foundIssue.issue_text,
          "issues.$.created_by": req.body.created_by || foundIssue.created_by,
          "issues.$.assigned_to":
            req.body.assigned_to || foundIssue.assigned_to,
          "issues.$.status_text":
            req.body.status_text || foundIssue.status_text,
          "issues.$.open": req.body.open || foundIssue.open,
          "issues.$.updated_on": dateAutoGen(),
        },
      };
      const doc = await Project.findOneAndUpdate(filter, update, {
        new: true,
      });
      const updatedIssue = doc.issues.filter((obj) => {
        return obj._id.toString() === req.body._id;
      })[0];
      var _id = new mongoose.Types.ObjectId(updatedIssue._id);
      return res.status(200).json({ result: "successfully updated", _id: _id });
    })

    .delete(async (req, res) => {
      let project = req.params.project;
      if (req.body._id === "" || !req.body._id) {
        return res.status(202).json({ error: "missing _id" });
      }
      const issueID = req.body._id;
      const currentProject = await Project.findOne({ project_name: project });
      const currentIssues = currentProject.issues;
      const currentIssue = currentIssues.filter(
        (obj) => obj._id.toString() === issueID
      )[0];
      if (!currentIssue) {
        return res
          .status(202)
          .json({ error: "could not delete", _id: issueID });
      }

      const Doc = Project.findOneAndUpdate(
        { project_name: project },
        { $pull: { issues: { _id: req.body._id } } }
      ).then(async (data) => {
        if (data == null) {
          return res
            .status(202)
            .json({ error: "could not delete", _id: issueID });
        } else {
          return res.status(200).json({
            result: "successfully deleted",
            _id: issueID,
          });
        }
      });
    });
};
