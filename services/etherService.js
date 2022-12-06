const Web3 = require("web3");
// The Web3 object
const web3 = new Web3("https://web3-trial.cloudflare-eth.com/v1/mainnet");
const Web3EthAccounts = require("web3-eth-accounts");

const etherService = {
  verifySignature: async (signature, address,message) => {
    const accounts = new Web3EthAccounts();

    const recoveredAddress = accounts.recover(message, signature);

    console.log(recoveredAddress); // The address that signed the message

    const isValid = recoveredAddress.toLowerCase() == address;

    if (isValid) {
      console.log("Signature is legitimate and matches the given address.");
    } else {
      console.log(
        "Signature is not legitimate or does not match the given address."
      );
    }
    return isValid;
  },
};

// Export the helper object
module.exports.etherService = etherService;
