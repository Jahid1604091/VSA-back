const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User');
const checkObjectId = require('../../middleware/checkObjectId');

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  auth,
  check('text', 'Text is required').notEmpty(),
  check('v_url', 'Link or video url is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        video_id: req.body.v_url.split("v=")[1].split("&")[0],
        name: user.name,
        avatar: user.avatar,
        views: 0,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// @route    GET api/posts/me
// @desc     Get all my posts
// @access   Protected
router.get('/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Public
router.get('/:id', checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'name');
    let likedIds = []
    post.likes.forEach(element => {
      likedIds.push(element.user)
    });

    // console.log(likedIds)
    if (!post) {
      return res.status(404).json([{ msg: 'Post not found' }]);
    }

    const likedUsers = await User.find({ _id: { $in: likedIds } }).select('-password');

    res.json({ post, likedUsers });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', [auth, checkObjectId('id')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json([{ msg: 'Post not found' }]);
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json([{ msg: 'User not authorized' }]);
    }

    await post.remove();

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json([{ msg: 'Post already liked' }]);
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);


    // Check if the post has not yet been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json([{ msg: 'Post has not yet been liked' }]);
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    return res.json(post.likes);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/views/:id
// @desc     update views
// @access   Public
router.put('/views/:id', checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.views = post.views + 1;
    await post.save();
    return res.json(post.views);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;