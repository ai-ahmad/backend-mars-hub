require("dotenv").config();
const fs = require("fs");
const path = require("path");

const deleteFile = (fileUrl) => {
  if (!fileUrl) return;

  let filePath = fileUrl;

  if (fileUrl.startsWith(process.env.DOMAIN)) {
    filePath = fileUrl.replace(process.env.DOMAIN, "");
  } else if (fileUrl.startsWith("http://localhost:8000")) {
    filePath = fileUrl.replace("http://localhost:8000", "");
  }

  const absolutePath = path.resolve(__dirname, "../", filePath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      console.error(`❌ Ошибка удаления файла (${filePath}):`, err.message);
    } else {
      console.log(`✅ Файл удалён: ${absolutePath}`);
    }
  });
};

module.exports = deleteFile;
