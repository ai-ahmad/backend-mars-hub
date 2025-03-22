require("dotenv").config();

const mediaUrlCreator = (filename, folder) => {
  const uploadUrl = process.env.DOMAIN || 'http://localhost:8000';
  return `${uploadUrl}/uploads/${folder}/${filename}`;
};

module.exports = mediaUrlCreator;
