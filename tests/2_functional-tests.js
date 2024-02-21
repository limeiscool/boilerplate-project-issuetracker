const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("POST /api/issues/:project", () => {
    test("Create issue with every feild", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Test Issue",
          issue_text: "This is a test issue",
          created_by: "Test User",
          assigned_to: "Tester",
          status_text: "In Testing",
        })
        .end((err, res) => {
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "This is a test issue");
          assert.equal(res.body.created_by, "Test User");
          assert.isNotEmpty(res.body.created_on);
          assert.isNotEmpty(res.body.updated_on);
          assert.equal(res.body.assigned_to, "Tester");
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "In Testing");
          done();
        });
    });
    test("Create issue with only required feilds", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Test Issue",
          issue_text: "This is a test issue",
          created_by: "Test User",
        })
        .end((err, res) => {
          console.log(res.body);
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, "Test Issue");
          assert.equal(res.body.issue_text, "This is a test issue");
          assert.equal(res.body.created_by, "Test User");
          assert.isNotEmpty(res.body.created_on);
          assert.isNotEmpty(res.body.updated_on);
          assert.isEmpty(res.body.assigned_to);
          assert.equal(res.body.open, true);
          assert.isEmpty(res.body.status_text);
          done();
        });
    });
    test("Create issue with missing required feilds", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          created_by: "Test User",
        })
        .end((err, res) => {
          console.log(res.body);
          assert.equal(res.status, 400);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
});
