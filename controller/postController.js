const Post = require("../models/Post");
const User = require("../models/User");
const { success, error } = require("../utils/responseWrapper");
const cloudinary = require('cloudinary').v2
const { mapPostOutput } = require("../utils/Utils");

const createPostController = async (req, res) => {
  try {
    const { caption,postImg } = req.body;
    if(!caption || !postImg){
      return res.send(error(400 , "Caption and postImg are required"));
    }
    const cloudImg = await cloudinary.uploader.upload_large(postImg,{
      folder : 'postImg'
    })

    const owner = req._id;
    const user = await User.findById(req._id);
    const post = await Post.create({
      owner,
      caption,
      image : {
        publicId : cloudImg.public_id,
        url : cloudImg.url
      },
    });

    user.posts.push(post._id);
    await user.save();

    return res.send(success(201, {post}));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const likeAndUnlikePost = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;

    const post = await Post.findById(postId).populate('owner');
    if (!post) {
      return res.send(error(400, "Post not found"));
    }

    if (post.likes.includes(currUserId)) {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
    } else {
      post.likes.push(currUserId);
    } 
    await post.save();
    return res.send(success(200 , {post : mapPostOutput(post , req._id)}));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, caption } = req.body;
    const currUserId = req._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== currUserId) {//owner is a 12 dgit hexadecimal binary something
      return res.send(error(403, "Only owner can update"));
    }

    if (caption) {
      post.caption = caption;
    }

    await post.save();

    return res.send(success(200, "Post updated successfully"));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const deletePostController = async(req , res) => {
    const {postId} = req.body; 
    const currUserId = req._id;

    const currUser = await User.findById(currUserId);
    const post = await Post.findById(postId);
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.owner.toString() !== currUserId) {
      return res.send(error(403, "Only owner can delete post"));
    }

    const index = currUser.posts.indexOf(postId);
    currUser.posts.splice(index , 1);

    await currUser.save();
    await post.deleteOne();

    return res.send(success(200 , "post deleted sucessfully"))

}
module.exports = {
  createPostController,
  likeAndUnlikePost,
  updatePostController,
  deletePostController
};
