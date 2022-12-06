const chai = require("chai");
const chaiHttp = require("chai-http");

// Import the server and the database service
const { server } = require("../app");
const { dbService } = require("../services/dbService");

// Import the constants
const { constants } = require("../constants");

// Import the ether servic
const { etherService } = require("../services/etherService");

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Applications", () => {
  // Clear the database before each test
  beforeEach(async () => {
    await dbService.query("DELETE FROM applications");
  });

  // Test the POST /api/applications route
  describe("POST /api/applications", () => {
    // The application to insert
    const application = {
      address: "0xaf5a6b093bcd2ef9ce9ffc5555c71dae6e58bef9",
      signature:
        "0x0bf04eb2efea30e13125111dd2d7a28b3b851d276e79f2351d7236488e7c73346ca3f84b357dcd37f367bea9b9235cbcb410aba43092f21ebf9a3313de705ad41b",
      message: "hello world",
      twitter: "@bonkxbt",
      applicationBody: "PLEASE ACCEPT ME HUHU",
    };
    it("should insert a new application", async () => {
      // Insert the application
      const res = await chai
        .request(server)
        .post("/api/applications")
        .send(application);

      // Check the response
      res.should.have.status(200);
      res.body.should.be.a("object");
      res.body.should.have.property("address").eql(application.address);
      res.body.should.have.property("twitter").eql(application.twitter);
      res.body.should.have.property("status").eql(constants.SUBMITTED);
      res.body.should.have.property("submittedon");
      res.body.should.have.property("updatedon");
      res.body.should.have
        .property("applicationbody")
        .eql(application.applicationBody);
    });
    it("should return an error if the application already exists", async () => {
      // The application to insert
      // Insert the application
      await chai.request(server).post("/api/applications").send(application);

      // Try to insert the same application again
      const res = await chai
        .request(server)
        .post("/api/applications")
        .send(application);

      // Check the response
      res.should.have.status(400);
      res.body.should.be.a("object");
      res.body.should.have
        .property("message")
        .eql("Application already exists");
    });

    it("should return an error if the signature is invalid", async () => {
      application.signature =
        "0x9e5058a1a4781c85d26d647d1bb7efaf9b3ea934451f4efe17a958b39989a57c0fbc54d8c399e21d48a008624f97c31271a60245d7aa81e033a498404d95a2b91b";
      // Insert the application
      const res = await chai
        .request(server)
        .post("/api/applications")
        .send(application);

      // Check the response
      res.should.have.status(400);
      res.body.should.be.a("object");
      res.body.should.have.property("message").eql("Invalid_Signature");
    });
  });
});


describe("PUT /api/applications", () => {
  beforeEach(async () => {
    await dbService.query("DELETE FROM applications");
  });
  const application = {
    address: "0xaf5a6b093bcd2ef9ce9ffc5555c71dae6e58bef9",
    signature:
      "0x0bf04eb2efea30e13125111dd2d7a28b3b851d276e79f2351d7236488e7c73346ca3f84b357dcd37f367bea9b9235cbcb410aba43092f21ebf9a3313de705ad41b",
    message: "hello world",
    twitter: "@bonkxbt",
    applicationBody: "PLEASE ACCEPT ME HUHU",
  };
  it("should update an existing application", async () => {
    // Insert a new application
    await chai.request(server).post("/api/applications").send(application);

    // Update the application
    const updatedApplication = {
      signer: "0xb0c5c06af6145f279f8ec7e3f8a9605ba7fb8ebe",
      signature:
        "0xcc8bdaac08efb6ff6c85e0e5ea4cc97bfdf3ff31e10acb8c4665d80d834796aa4ecea31f3abcd1e89b6ab47c8938e9e9ae2ce9bb8ce7dd7fca443377bcacd16a1b",
      message: "verifying signature",
      address: "0xaf5a6b093bcd2ef9ce9ffc5555c71dae6e58bef9",
      twitter: "@bonkxbt",
      status: constants.APPROVED,
    };
    const res = await chai
      .request(server)
      .put("/api/applications")
      .send(updatedApplication);

    // Check the response
    res.should.have.status(200);
    res.body.should.be.a("object");
    res.body.should.have.property("address").eql(application.address);
    res.body.should.have.property("twitter").eql(application.twitter);
    res.body.should.have.property("status").eql(constants.APPROVED);
    res.body.should.have.property("submittedon");
    res.body.should.have.property("updatedon");
    res.body.should.have
      .property("applicationbody")
      .eql(application.applicationBody);
  });

  it("should return an error if the application does not exist", async () => {
    // Insert a new application
    await chai.request(server).post("/api/applications").send(application);

    // Update the application
    const updatedApplication = {
      signer: "0xb0c5c06af6145f279f8ec7e3f8a9605ba7fb8ebe",
      signature:
        "0xcc8bdaac08efb6ff6c85e0e5ea4cc97bfdf3ff31e10acb8c4665d80d834796aa4ecea31f3abcd1e89b6ab47c8938e9e9ae2ce9bb8ce7dd7fca443377bcacd16a1b",
      message: "verifying signature",
      address: "0xaf5a6b093bcd2ef9ce9ffc5555c71dae6e58bef9zz",
      twitter: "@bonkxbtww",
      status: constants.APPROVED,
    };
    const res = await chai
      .request(server)
      .put("/api/applications")
      .send(updatedApplication);

    // Check the response
    res.should.have.status(404);
    res.body.should.be.a("object");
  });

  it("should return an error if the signature is unauthorized", async () => {
    // Update the application
    const updatedApplication = {
      signature:
        "0x0bf04eb2efea30e13125111dd2d7a28b3b851d276e79f2351d7236488e7c73346ca3f84b357dcd37f367bea9b9235cbcb410aba43092f21ebf9a3313de705ad41b",
      signer: "0xb0c5c06af6145f279f8ec7e3f8a9605ba7fb8ebe",
      message: "verifying signature",
      address: "0xaf5a6b093bcd2ef9ce9ffc5555c71dae6e58bef9",
      twitter: "@bonkxbt",
      status: constants.APPROVED,
    };
    const res = await chai
      .request(server)
      .put("/api/applications")
      .send(updatedApplication);

    // Check the response
    res.should.have.status(400);
    res.body.should.be.a("object");
    res.body.should.have.property("message").eql("Unauthorized_Update");
  });

});
