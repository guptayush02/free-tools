const User = require('../models/User')

exports.recordScore = async (req, res) => {
  try {
    const userId = req.userId
    const { points } = req.body

    if (!points || typeof points !== 'number') {
      return res.status(400).json({ error: 'Invalid points' })
    }

    const user = await User.findByIdAndUpdate(userId, { $inc: { score: points } }, { new: true })

    if (!user) return res.status(404).json({ error: 'User not found' })

    res.json({ success: true, score: user.score })
  } catch (error) {
    console.error('Record score error:', error)
    res.status(500).json({ error: 'Failed to record score' })
  }
}
