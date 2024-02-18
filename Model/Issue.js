const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const issueSchema = new Schema({
  project: String,
  issues: [
    {
      issue_title: String,
      issue_text: String,
      created_on: Date,
      updated_on: Date,
      created_by: String,
      assigned_to: String,
      open: Boolean,
      status_text: String,
    },
  ],
});

const Issue = model("Issue", issueSchema);
module.exports = Issue;
