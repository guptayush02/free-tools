const Story = require('../models/Story');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create a new story
exports.createStory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    const story = new Story({
      title,
      description,
      createdByUsername: user.username,
      createdByUserId: userId,
      lines: [],
      totalContributions: 0,
    });

    await story.save();

    res.status(201).json({
      message: 'Story created successfully',
      story,
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
};

// Add a line to a story
// exports.addLineToStory = async (req, res) => {
//   try {
//     const { text, isAnonymous } = req.body;
//     const userId = req.userId;
//     const { storyId } = req.params;

//     const user = await User.findById(userId);

//     if (!mongoose.Types.ObjectId.isValid(storyId)) {
//       return res.status(400).json({ error: 'Invalid story ID format' });
//     }

//     const story = await Story.findById(storyId).lean();

//     if (!story) {
//       return res.status(404).json({ error: 'Story not found' });
//     }

//     const storyUpdate = await Story.findByIdAndUpdate(
//       storyId,
//       {
//         $push: {
//           lines: {
//             text: text.trim(),
//             contributorUsername: isAnonymous ? 'Anonymous' : user.username,
//             isAnonymous,
//             createdAt: new Date()
//           }
//         },
//         $inc: { totalContributions: 1 },
//         updatedAt: new Date()
//       },
//       { new: true, runValidators: true }  // Return updated doc
//     );

//     // Update user score (separate for safety)
//     await User.findByIdAndUpdate(userId, {
//       $inc: { score: 5, totalStoriesContributed: 1 }
//     });

//     return res.json({
//       message: 'Line added successfully',
//       storyUpdate,
//     });
//   } catch (error) {
//     console.error('Add line error:', error);
//     res.status(500).json({ error: 'Failed to add line to story' });
//   }
// };

exports.addLineToStory = async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    const userId = req.userId;
    
    // ✅ FIX: storyId from req.body (matches frontend), not req.params
    const { storyId } = req.body;

    console.log('📥 Add line:', { storyId, text: text?.substring(0, 50), userId });

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return res.status(400).json({ error: 'Invalid story ID' });
    }

    const user = await User.findById(userId).select('username');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const story = await Story.findByIdAndUpdate(
      storyId,
      {
        $push: {
          lines: {
            text: text.trim(),
            contributorUsername: isAnonymous ? 'Anonymous' : user.username,
            isAnonymous,
            createdAt: new Date()
          }
        },
        $inc: { totalContributions: 1 },
        updatedAt: new Date()
      },
      { new: true }  // ✅ Return UPDATED story
    );

    if (!story) return res.status(404).json({ error: 'Story not found' });

    // Update user score
    await User.findByIdAndUpdate(userId, {
      $inc: { score: 5, totalStoriesContributed: 1 }
    });

    res.json({
      message: 'Line added successfully ✅',
      story: story  // ✅ Full updated story
    });
  } catch (error) {
    console.error('❌ Add line error:', error);
    res.status(500).json({ error: 'Failed to add line' });
  }
};

// Get all stories
exports.getAllStories = async (req, res) => {
  try {
    const stories = await Story.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .limit(100);

    res.json(stories);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

// Get a single story
exports.getStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json(story);
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
};

// Get user's stories
exports.getUserStories = async (req, res) => {
  try {
    const userId = req.userId;

    const stories = await Story.find({ createdByUserId: userId });

    res.json(stories);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ error: 'Failed to fetch user stories' });
  }
};
