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
})


module.exports = router;