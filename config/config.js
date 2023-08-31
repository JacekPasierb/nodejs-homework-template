const path = require("node:path");

const getAvatarsPath = () => {
  return path.join(__dirname,"..","public", "avatars");
};

module.exports = {
    AVATARS_PATH: getAvatarsPath(),
}
