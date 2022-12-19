const sharp = require("sharp");
const fs = require('fs');
const path = require('path');
const { constants } = require("../constants");

const imageService = {
  createTweetImage(username) {
    const png = sharp(path.join(`/${__dirname}/files`, 'template.png'));

    // Create an SVG image with the text "Hello World"
    const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="450" height="450">
            <text x="100" y="100" fill="#000" font-size="24">${constants.CONGRATULATIONS_TEXT}${username}</text>
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