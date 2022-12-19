const Twit = require("twit");
const fs = require('fs');
const path = require('path');

const client = new Twit({
  consumer_key: "uZ2zXfLWEqo0VatQtwYtyAOaU",
  consumer_secret: "6CMTSiRL3pcSzIfvexQeWGHAVMs7J66x1OVTn0RO5c9m92o80s",
  access_token: "2751997813-LYfdbSxhyLrjtDmOlIptkyjqmDH3l8X4nhYO27M",
  access_token_secret: "waGFX4ksTxyL1vldKUgmzkaMbrSHHkz6e85mgTFVLbUeH",
});


const { constants } = require("../constants");
const { imageService } = require("./imageService");

const twitterService = {
  sendTweet: async (username) => {
    return new Promise( async (resolve, reject) => {
      const bufferImage = await imageService.createTweetImage(username);
      const imageData = Buffer.from(bufferImage).toString("base64");
      client.post('media/upload', { media_data: imageData },(error,data,response)=>{
        if (error) {
            console.log(error);
            reject(error);
          } else {
            const mediaIdStr = data.media_id_string;
            const params = { status: constants.CONGRATULATIONS_TWEET +" "+ username, media_ids: [mediaIdStr] };
            client.post(
                "statuses/update",
                params,
                (error, data, response) => {
                  if (error) {
                    console.log(error);
                    reject(error);
                  } else {
                    // console.log(data);
                    resolve(data);
                  }
                }
              );
          }
      })


    });
  },

  verifyTweet: async (username) => {
    const numTweets = 10;

    try {
      // Use the Twit instance to pull recent tweets from the specified user
      const tweets = await client.get("statuses/user_timeline", {
        screen_name: username,
        count: numTweets,
        exclude_replies: true,
        include_rts: false,
      });
      var text = JSON.stringify(tweets.data);
      if (text.includes(constants.VERIFICATION_TEXT)) {
        console.log("VALID TWEET");
        return true;
      } else {
        console.log("INVALID TWEET");
        return false;
      }
    } catch (error) {
      console.log(`${username}:${error?.message}`);
      return false;
    }
  },

  verifyFollow: async (username) => {
    try {
      // Get a list of the users that user1 follows
      const { data } = await client.get('friendships/show', {
        source_screen_name: username,
        target_screen_name: constants.VERIFICATION_FOLLOW,
      });

      // Check if user2 is in the list of users that user1 follows
      const follows = data.relationship.source.following;
      console.log(follows);
      return follows;
    } catch (error) {
        console.log(`${username}:${error?.message}`);
        return false;
    }
  },
};

// Export the helper object
module.exports.twitterService = twitterService;


