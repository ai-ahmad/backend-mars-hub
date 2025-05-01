const userModel = require("../models/userModel");

// Search users by username or firstName with pagination
const searchUsers = async (req, res) => {
  try {
    let { query, limit = 10, page = 1 } = req.query;

    // Sanitize and validate query
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Search query is required" });
    }
    query = query.trim();
    if (query.length < 2) {
      return res.status(400).json({ message: "Search query must be at least 2 characters long" });
    }

    // Parse pagination parameters
    limit = parseInt(limit, 10);
    page = parseInt(page, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      limit = 10; // Default limit
    }
    if (isNaN(page) || page < 1) {
      page = 1; // Default page
    }
    const skip = (page - 1) * limit;

    // Search by username or firstName (case-insensitive)
    const searchCriteria = {
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
      ],
    };

    // Execute query with pagination and sorting
    const searchedUsers = await userModel
      .find(searchCriteria)
      .select("-password -email") // Exclude sensitive fields
      .sort({ username: 1 }) // Sort by username for consistent results
      .limit(limit)
      .skip(skip)
      .lean(); // Improve performance for large datasets

    // Get total count for pagination metadata
    const totalUsers = await userModel.countDocuments(searchCriteria);

    // Prepare response with pagination metadata
    res.status(200).json({
      success: true,
      data: searchedUsers,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { searchUsers };