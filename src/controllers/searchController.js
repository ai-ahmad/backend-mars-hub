const userModel = require("../models/userModel");

const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchedUsers = await userModel.find({
      username: { $regex: query, $options: "i" },
    });

    res.status(200).json(searchedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchUsers };
