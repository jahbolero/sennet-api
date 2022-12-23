const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { constants } = require("../constants");

const imageService = {
  createTweetImage(username) {
    const png = sharp(path.join(`/${__dirname}/files`, "template.png"));

    // Create an SVG image with the text "Hello World"
    const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="759">
          <text x="200" y="410" fill="#FFFFFF" font-size="52">Congratulations ${username}</text>
            <text x="200" y="550" fill="#FFFFFF" width="250" font-size="36">Your application to the mummy list has</text>
            <text x="200" y="600" fill="#FFFFFF" width="250" font-size="36">been accepted. Welcome to the Desert!</text>
          </svg>
        `;

    return png
      .composite([
        {
          input: Buffer.from(svg),
          blend: "over",
        },
      ]).toBuffer();
  },
};

module.exports.imageService = imageService;