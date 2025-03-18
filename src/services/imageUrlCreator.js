require("dotenv").config();

const imageUrlCreator = (filename, folder) => {
  const uploadUrl = process.env.DOMAIN || 'http://localhost:8000';
  return `${uploadUrl}/uploads/${folder}/${filename}`;
};

module.exports = imageUrlCreator;
