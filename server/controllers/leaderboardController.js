const User = require('../models/User');

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const leaderboard = await User.find()
      .select('-password')
      .sort({ score: -1 })
      .limit(limit);

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      score: user.score,
      bio: user.bio,
      profileImage: user.profileImage,
      totalStoriesContributed: user.totalStoriesContributed,
      createdAt: user.createdAt,
    }));

    res.json(leaderboardWithRank);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

// Get user rank
exports.getUserRank = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rank =
      (await User.countDocuments({ score: { $gt: user.score } })) + 1;

    res.json({
      username: user.username,
      score: user.score,
      rank,
      bio: user.bio,
      totalStoriesContributed: user.totalStoriesContributed,
    });
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
};
