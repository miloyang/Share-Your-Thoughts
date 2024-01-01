// Import dependencies
const { User, Thought } = require('../models');

// Create functionality for the Thought model
const thoughtController = {
  // GET all thoughts (callback function for `GET /api/thoughts`)
  getAllThoughts(req, res) {
    Thought.find({})
      .populate({
        path: 'reactions',
        select: '-__v',
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbThoughtData => res.json(dbThoughtData))
      .catch(err => {
        console.error(err);
        res.status(500).json(err); 
      });
  },

  // GET one thought by id (callback function for `GET /api/thoughts/:id`)
  getSingleThought({ params }, res) {
    Thought.findOne({ _id: params.id })
      .populate({
        path: 'reactions',
        select: '-__v',
      })
      .select('-__v')
      .sort({ _id: -1 })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thoughts found with that id' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => {
        console.error(err);
        res.status(500).json(err);
      });
  },

  // Add a thought to the database (callback function for `POST /api/thoughts`)
  createThought({ body }, res) {
    Thought.create(body)
      .then(({ _id }) => {
        return User.findOneAndUpdate(
          { _id: body.userId },
          { $push: { thoughts: _id } },
          { new: true }
        );
      })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No user found with this id!' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },

  // Update thought by id (callback function for `PUT /api/thoughts/:id`)
  updateThought({ params, body }, res) {
    Thought.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thoughts found with this id' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },

  // Delete thought by id (callback function for `DELETE /api/thoughts/:id`)
  deleteThought({ params }, res) {
    Thought.findOneAndDelete({ _id: params.id })
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thought with this id' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(500).json(err)); 
  },

  // Add reaction (callback function for `POST /api/thoughts/:thoughtId/reactions`)
  createReaction({ params, body }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $push: { reactions: body } },
      { new: true, runValidators: true }
    )
      .populate({ path: 'reactions', select: '-__v' })
      .select('-__v')
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No thoughts with this id' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },

  // Delete reaction (callback function for `DELETE /api/thoughts/:thoughtId/reactions/:reactionId`)
  deleteReaction({ params }, res) {
    Thought.findOneAndUpdate(
      { _id: params.thoughtId },
      { $pull: { reactions: { reactionId: params.reactionId } } },
      { new: true }
    )
      .then(dbThoughtData => {
        if (!dbThoughtData) {
          return res.status(404).json({ message: 'No reaction found with this id' });
        }
        res.json(dbThoughtData);
      })
      .catch(err => res.status(400).json(err));
  },
};

// Export the module
module.exports = thoughtController;





















// const { User, Thought } = require('../models');

// module.exports = {
//     // Get all thoughts
//     async getAllThoughts(req, res) {
//         try {
//             const thoughts = await Thought.find()
//             .populate('users');
//             res.json(thoughts);
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     },
//     // Get a thought
//     async getSingleThought(req, res) {
//         try {
//             const thought = await Thought.findOne({ _id: req.params.thoughtId })
//             .populate('users');

//             if (!thought) {
//                 return res.status(404).json({ message: 'No thought found!' });
//             }
//             res.json(thought);
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     },
//     // Create a thought
//     async createThought(req, res) {
//         try {
//             const thought = await Thought.create(req.body);
//             res.json(thought);
//         } catch (err) {
//             console.log('error creating a new thought');
//             return res.status(500).json(err);
//         }
//     },
//     // Delete a thought
//     async deleteThought(req, res) {
//         try {
//             const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

//             if (!thought) {
//                 return res.status(404).json({ message: 'No thought found!' });
//             }

//             await User.deleteMany({ _id: { $in: thought.users } });
//             res.json({ message: 'Thought and User deleted!' });
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     },
//     // Update a thought
//     async updateThought(req, res) {
//         try {
//             const thought = await Thought.findOneAndUpdate(
//                 { _id: req.params.thoughtId },
//                 { $set: req.body },
//                 { runValidators: true, new: true }
//             );

//             if (!thought) {
//                 return res.status(404).json({ message: "No thought found!" });
//             }

//             res.json(thought);
//         } catch (err) {
//             res.status(500).json(err);
//         }
//     },
// };