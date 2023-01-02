const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { constants } = require("../constants");

const imageService = {
  createTweetImage(twitter, userImage) {
    const png = sharp(path.join(`/${__dirname}/files`, "template.png"));
    const base64EncodedBuffer = userImage.toString("base64");
    const imageDataUri = `data:image/jpeg;base64,${base64EncodedBuffer}`;

    // Create an SVG image with the text "Hello World"
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="759">

    <!-- Define the hexagon shape for the clipping path -->
    <clipPath id="hexagonClip">
      <polygon points="500,100 575,100 625,200 575,300 425,300 375,200 425,100" />
      
    </clipPath>
    
    <!-- Hexagon border -->
<polygon points="500,100 575,100 625,200 575,300 425,300 375,200 425,100" stroke-linejoin="round" stroke-width="15" stroke="#FF8F27
" fill="#FF8F27" />
    
    <!-- Profile picture with clip-path applied -->
    <image x="350" y="50" width="300" height="300" xlink:href="data:image/jpeg;base64,${userImage.toString(
      "base64"
    )}" clip-path="url(#hexagonClip)" />
    
    <text x="150" y="450" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="60">Congratulations @${twitter}</text>
    <text x="150" y="550" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" width="250" font-size="42">Your application to the mummy list has</text>
    <text x="150" y="600" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" width="250" font-size="42">been accepted. Welcome to the Desert!</text>
    
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