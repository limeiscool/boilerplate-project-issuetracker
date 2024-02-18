const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("POST /api/issues/:project", () => {
    test("Create issue with every field", (done) => {});
  });
});
