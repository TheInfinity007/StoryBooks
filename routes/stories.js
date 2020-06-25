const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');

const Story = require('../models/Story');

// @desc 			Show add page
// @route 		GET /stories/new
router.get('/new', (req, res)=>{
	res.render("stories/new");
})

// @desc 		Process add form
// @route 	POST /stories
router.post('/', async (req, res)=>{
	try{
		req.body.user = req.user._id;
		await Story.create(req.body);
		res.redirect('/dashboard');
	}catch(err){
		console.error(err);
		res.render('error/500');
	}
});

// @desc 			Show all stories
// @route 		GET /stories
router.get('/', async (req, res)=>{
	try{
		const stories = await Story.find({status: 'public'}).populate('user').sort({ createdAt: 'desc'}).lean();
		res.render('stories/index', {stories});
	}catch(err){
		console.error(err);
		res.render('error/500');
	}
});

// @desc 			Show Single Story
// @route 		GET /stories/:id
router.get('/:id', async(req, res)=>{
	try{
		let story = await Story.findById(req.params.id).populate('user').lean();
		console.log(story)
		if(!story)	return res.render('error/404');
		res.render('stories/show', {story});
	}catch(err){
		console.error(err);
		res.render('error/404');
	}
})

// @desc 			Show Edit page
// @route 		GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res)=>{
	try{
		const story = await Story.findById(req.params.id).lean();
		if(!story) res.render('error/404');
		if(story.user.toString() != req.user._id.toString()) 	res.redirect('/stories');
		else{
			res.render('stories/edit', story);
		}
	}catch(err){
		console.log(err);
		return res.render('error/500');
	}
});

// @desc 			Update Story
// @route 		PUT /stories/:id
router.put('/:id', ensureAuth, async(req, res)=>{
	try{
		let story = await Story.findById(req.params.id);
		if(!story)	return res.render('error/404');
		if(story.user.toString() != req.user._id.toString()) res.redirect('/stories');
		else{
			story = await Story.findOneAndUpdate({_id: req.params.id}, req.body, {
				new: true,
				runValidators: true
			});
			res.redirect('/dashboard');
		}
	}catch(err){
		console.log(err);
		return res.render('error/500');
	}
});

// @desc 			Delete Story
// @route 		DELETE /stories/:id
router.delete('/:id', ensureAuth, async(req, res)=>{
	try{
		await Story.findByIdAndRemove(req.params.id);
		console.log("Story Deleted Successfully");
		res.redirect("/dashboard");
	}catch(err){
		console.log(err);
		return res.render('error/500');
	}
});

// @desc 			Show User Stories
// @route 		GET /stories/user/:userid
router.get('/user/:userId', async (req, res)=>{
	try{
		const stories = await Story.find({ user: req.params.userId, status: 'public'}).populate('user').lean();
		res.render('stories/index', {stories});
	}catch(err){
		console.error(err);
		res.render('error/500');
	}
})


module.exports = router;