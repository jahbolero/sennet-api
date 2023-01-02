const Twit = require("twit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const client = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const { constants } = require("../constants");
const { imageService } = require("./imageService");

const twitterService = {
  sendTweet: async (twitter) => {
    return new Promise(async (resolve, reject) => {
      const user = await twitterService.getUserInfo(twitter);
      const imgUrl = user.profile_image_url.replace("normal","400x400");
      console.log(imgUrl);
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      const userImage = Buffer.from(response.data, 'binary');
      const bufferImage = await imageService.createTweetImage(twitter,userImage);
      const imageData = Buffer.from(bufferImage).toString("base64");
      client.post(
        "media/upload",
        { media_data: imageData },
        (error, data, response) => {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            const mediaIdStr = data.media_id_string;
            const params = {
              status: constants.CONGRATULATIONS_TWEET.replace("User_ID",twitter),
              media_ids: [mediaIdStr],
            };
            client.post("statuses/update", params, (error, data, response) => {
              if (error) {
                console.log(error);
                reject(error);
              } else {
                // console.log(data);
                resolve(data);
              }
            });
          }
        }
      );
    });
  },

  verifyTweet: async (twitter) => {
    const numTweets = 10;

    try {
      // Use the Twit instance to pull recent tweets from the specified user
      const tweets = await client.get("statuses/user_timeline", {
        screen_name: twitter,
        count: numTweets,
        exclude_replies: true,
        include_rts: false,
      });
      var text = JSON.stringify(tweets.data);
      if (text.includes(constants.VERIFICATION_TEXT)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(`${twitter}:${error?.message}`);
      return false;
    }
  },

  verifyFollow: async (twitter) => {
    try {
      // Get a list of the users that user1 follows
      const { data } = await client.get("friendships/show", {
        source_screen_name: twitter,
        target_screen_name: constants.VERIFICATION_FOLLOW,
      });

      // Check if user2 is in the list of users that user1 follows
      const follows = data.relationship.source.following;
      return follows;
    } catch (error) {
      console.log(`${twitter}:${error?.message}`);
      return false;
    }
  },

  getUserInfo: async (twitter) => {
    try {
      const { data } = await client.get("users/show", {
        screen_name: twitter,
      });
      return data;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
  cleanTwitterUser: (twitter) =>{
    return twitter?.replace(/@/g, '');
  }
};

// Export the helper object
module.exports.twitterService = twitterService;