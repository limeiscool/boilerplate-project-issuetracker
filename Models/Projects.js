const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const issueSchema = new Schema({
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: Boolean,
  status_text: String,
});

const projectSchema = new Schema({
  project_name: String,
  issues: [issueSchema],
});

const Project = model("Project", projectSchema, "Projects");
module.exports = Project;
