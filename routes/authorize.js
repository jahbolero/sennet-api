const express = require("express");
const { etherService } = require("../services/etherService");
const router = express.Router();

router.route("/authorize").post(async (req, res) => {
  const {signer ,signature, message } = req.body;

  var authorizedSigners = process.env.AUTHORIZED_SIGNERS.split(",");

  const messageObject = JSON.parse(message);

  if(etherService.isSignatureExpired(messageObject.date)){
    res.status(400).send({ message: "Expired_Signature" });
    return;
  }
  
  const isValid = await etherService.verifySignature(
    signature,
    signer.toLocaleLowerCase(),
    message
  );

  const isAuthorized = authorizedSigners.find(
    (x) => x.toLocaleLowerCase() == signer.toLocaleLowerCase()
  );
  if (!isValid || !isAuthorized) {
    res.status(400).send({ message: "Unauthorized_Update" });
    return;
  }
  res.status(200).send(true);
});

module.exports = router;
