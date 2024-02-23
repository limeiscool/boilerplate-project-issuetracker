const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  let ID;
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
          ID = res.body._id;
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
          assert.equal(res.status, 202);
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });
  suite("GET /api/issues/:project", () => {
    test("View issues on a project", (done) => {
      chai
        .request(server)
        .get("/api/issues/test")
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
    test("View issues on a project with one fileter", (done) => {
      chai
        .request(server)
        .get("/api/issues/test?created_by=Test User")
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
    test("View issues on a project with multiple filters", (done) => {
      chai
        .request(server)
        .get("/api/issues/test?created_by=Test User&status_text=In Testing")
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
  suite("PUT /api/issues/:project/:issue_id", () => {
    test("Update one field on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: ID,
          issue_title: "Updated 1 Issue",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });
    test("Update multiple fields on an issue", (done) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: ID,
          issue_title: "Updated 2 Issue",
          issue_text: "This is an updated issue",
          created_by: "Updated User",
          assigned_to: "Updated Tester",
          status_text: "Updated In Testing",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });
    test("Update an issue with missing _id", (done) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          issue_title: "Updated 3 Issue",
        })
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
    test("Update an issue with no fields to update", (done) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: ID,
        })
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });
    test("Update an issue with an invalid _id", (done) => {
      const invalidID = "123456789012345678901234";
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: invalidID,
          issue_title: "Updated 4 Issue",
        })
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.equal(res.body._id, invalidID);
          assert.equal(res.body.error, "could not update");
          done();
        });
    });
  });
  suite("DELETE /api/issues/:project/:issue_id", () => {
    test("Delete an issue", (done) => {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: ID,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.result, "deleted successfully");
          done();
        });
    });
    test("Delete an issue with an invalid _id", (done) => {
      const invalidID = "123456789012345678901234";
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: invalidID,
        })
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.equal(res.body._id, invalidID);
          assert.equal(res.body.error, "could not delete");
          done();
        });
    });
    test("Delete an issue with no _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 202);
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
