const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const About = require('../models/about');
const Project = require('../models/project');
const Education = require('../models/education');
const Experience = require('../models/experience');
const Skills = require('../models/skills');

// About Routes
router.get('/about', async (req, res) => {
  try {
    const about = await About.findOne();
    res.json(about || { description: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching about data' });
  }
});

router.post('/about', auth, async (req, res) => {
  try {
    let about = await About.findOne();
    if (about) {
      about.name = req.body.name;
      about.position = req.body.position;
      about.description = req.body.description;
      about.profileImage = req.body.profileImage;
      await about.save();
    } else {
      about = await About.create(req.body);
    }
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: 'Error updating about data' });
  }
});

// Project Routes
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort('-createdAt');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

router.post('/projects', auth, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project' });
  }
});

router.put('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Education Routes
router.get('/education', async (req, res) => {
  try {
    const education = await Education.find().sort('-createdAt');
    res.json(education);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching education data' });
  }
});

router.post('/education', auth, async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json(education);
  } catch (err) {
    res.status(500).json({ message: 'Error creating education entry' });
  }
});

router.put('/education/:id', auth, async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!education) {
      return res.status(404).json({ message: 'Education entry not found' });
    }
    res.json(education);
  } catch (err) {
    res.status(500).json({ message: 'Error updating education entry' });
  }
});

router.delete('/education/:id', auth, async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) {
      return res.status(404).json({ message: 'Education entry not found' });
    }
    res.json({ message: 'Education entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting education entry' });
  }
});

// Experience Routes
router.get('/experience', async (req, res) => {
  try {
    const experience = await Experience.find().sort('-createdAt');
    res.json(experience);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching experience data' });
  }
});

router.post('/experience', auth, async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json(experience);
  } catch (err) {
    res.status(500).json({ message: 'Error creating experience entry' });
  }
});

router.put('/experience/:id', auth, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!experience) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }
    res.json(experience);
  } catch (err) {
    res.status(500).json({ message: 'Error updating experience entry' });
  }
});

router.delete('/experience/:id', auth, async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: 'Experience entry not found' });
    }
    res.json({ message: 'Experience entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting experience entry' });
  }
});

// Skills Routes
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find().sort('category');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching skills data' });
  }
});

router.post('/skills', auth, async (req, res) => {
  try {
    const skills = await Skills.create(req.body);
    res.status(201).json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Error creating skills entry' });
  }
});

router.put('/skills/:id', auth, async (req, res) => {
  try {
    const skills = await Skills.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!skills) {
      return res.status(404).json({ message: 'Skills entry not found' });
    }
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Error updating skills entry' });
  }
});

router.delete('/skills/:id', auth, async (req, res) => {
  try {
    const skills = await Skills.findByIdAndDelete(req.params.id);
    if (!skills) {
      return res.status(404).json({ message: 'Skills entry not found' });
    }
    res.json({ message: 'Skills entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting skills entry' });
  }
});

module.exports = router;
