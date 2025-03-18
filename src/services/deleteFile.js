require("dotenv").config()
const fs = require("fs");
const path = require("path");

const deleteFile = (image) => {
  const filePath = image.replace(process.env.DOMAIN, "");
  const absolutePath = path.resolve(path.join(__dirname, "../", filePath));
  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error(`Error deleting file (${filePath}):`, err.message);
    } else {
      console.log(`File deleted: ${absolutePath}`);
    }
  });
};

module.exports = deleteFile;
