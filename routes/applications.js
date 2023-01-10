const express = require("express");
const router = express.Router();
const { dbService } = require("../services/dbService");

const { etherService } = require("../services/etherService");
const { constants } = require("../constants");
const { twitterService } = require("../services/twitterService");

// Set up the API routes
router.get("/applications", async (req, res) => {
  let result = await dbService.query(`SELECT * FROM applications`);
  res.send(result);
});
router.get("/applications/filteredApplications", async (req, res) => {
  const {status,searchQuery} = req.query;
  let result;
  if(searchQuery == ""){
     result = await dbService.query(`SELECT * FROM applications WHERE status = $1`,[status]);
  }else{
    searchQuery = searchQuery.toLocaleLowerCase();
     result = await dbService.query(`SELECT * FROM applications WHERE status = $1 OR address = $2 OR twitter = $2`,[status, searchQuery]);
  }

  res.send(result.rows);
});

router.get("/applications/account", async (req, res) => {
  try {
    const { address,twitter } = req.query;
    const result = await dbService.getApplication(address.toLocaleLowerCase(),twitterService.cleanTwitterUser(twitter))
    const application = result.rows[0];

    if (dbService.isEmpty(application)) {
      res.status(404).send({application:null});
    }else{
      res.status(200).send({ application });
    }

  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Server Error" });
  }
});

router.get("/applications/verify", async (req, res) => {
  try {
    const { twitter,address } = req.query;
    const hasFollowed = await twitterService.verifyFollow(twitterService.cleanTwitterUser(twitter));
    const hasTweeted = await twitterService.verifyTweet(twitterService.cleanTwitterUser(twitter));
    const twitterInfo = await twitterService.getUserInfo(twitterService.cleanTwitterUser(twitter));
    const result = await dbService.getApplication(address.toLocaleLowerCase(),twitterService.cleanTwitterUser(twitter))
    const application = result.rows[0];
    
    res.status(200).send({ hasFollowed, hasTweeted,twitterInfo,application });
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Server Error" });
  }
});
// Define the "applications" route
router
  .route("/applications")
  // Insert a new application
  .post(async (req, res) => {
    try {
      const { address, signature, message, twitter, applicationBody } =
        req.body;

      const applicationObject = JSON.parse(applicationBody);

      //Check if the signature is valid, coming from the right address
      const isValid = await etherService.verifySignature(
        signature,
        address.toLocaleLowerCase(),
        message
      );
      if (!isValid) {
        res.status(400).send({ message: "Invalid_Signature" });
        return;
      }

      if(etherService.isSignatureExpired(applicationObject?.date)){
        res.status(400).send({ message: "Signature_Expired" });
        return;
      }

      // Check if the application already exists
      let result = await dbService.getApplication(
        address.toLocaleLowerCase(),
        twitterService.cleanTwitterUser(twitter)
      );
      let application = result.rows[0];
      if (!dbService.isEmpty(application)) {
        return res.status(400).send({ message: "Application already exists" });
      }
      // console.log("Verifying follow");
      // Verify if the application passes twitter verification.
      const isFollow = await twitterService.verifyFollow(twitterService.cleanTwitterUser(twitter));

      const isVerified = await twitterService.verifyTweet(twitterService.cleanTwitterUser(twitter));

      const twitterInfo = await twitterService.getUserInfo(twitterService.cleanTwitterUser(twitter));

      if (!isFollow || !isVerified) {
        let errorMessage = "";
        errorMessage += isFollow
          ? ""
          : `You need to follow ${constants.VERIFICATION_FOLLOW}.`;
        errorMessage += isVerified
          ? ""
          : `You need to send the verification tweet:${constants.VERIFICATION_TEXT}`;
        return res.status(400).send({ message: errorMessage });
      }

      // Insert the application into the database
      const submittedOn = new Date();
      const updatedOn = new Date();
      result = await dbService.query(
        `INSERT INTO applications
         (address, twitter, status, submittedOn, updatedOn, applicationBody,followers)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          address.toLocaleLowerCase(),
          twitterService.cleanTwitterUser(twitter),
          constants.SUBMITTED,
          submittedOn,
          updatedOn,
          applicationBody,
          twitterInfo.followers_count
        ]
      );
      application = result.rows[0];

      // Return the inserted application
      res.json(application);
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Server Error" });
    }
  })

  // Update an existing application
  .put(async (req, res) => {
    try {
      // Get the application data from the request body
      const { signature, signer, message, address, twitter, status } = req.body;
      const updatedon = new Date();

      let existingApplication = await dbService.getApplication(
        address.toLocaleLowerCase(),
        twitterService.cleanTwitterUser(twitter)
      );

      if (dbService.isEmpty(existingApplication)) {
        return res.status(400).send({ message: "Application does not exist" });
      }

      const isValid = await etherService.verifySignature(
        signature,
        signer,
        message
      );
      var authorizedSigners = process.env.AUTHORIZED_SIGNERS.split(",");
      console.log(authorizedSigners);
      console.log(signer);
      const isAuthorized = authorizedSigners.find(
        (x) => x.toLocaleLowerCase() == signer.toLocaleLowerCase()
      );
      if (!isValid || !isAuthorized) {
        res.status(400).send({ message: "Unauthorized_Update" });
        return;
      }

      // Update the application in the database
      const result = await dbService.query(
        `UPDATE applications
       SET status = $1, updatedon = $2
       WHERE address = $3 AND twitter = $4
       RETURNING *`,
        [status, updatedon, address.toLocaleLowerCase(), twitterService.cleanTwitterUser(twitter)]
      );
      const application = result.rows[0];

      // Check if the application was updated successfully
      if (dbService.isEmpty(application)) {
        res.status(404).send("Application not found");
      } else {
        // Return the updated application
        if (application.status == constants.APPROVED) {
          await twitterService.sendTweet(twitterService.cleanTwitterUser(twitter));
        }

        res.json(application);
      }
    } catch (e) {
      console.log(e);
      res.status(500).send({ message: "Server Error" });
    }
  });

module.exports = router;
