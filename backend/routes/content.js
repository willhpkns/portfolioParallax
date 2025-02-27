const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const About = require('../models/about');
const Project = require('../models/project');
const Education = require('../models/education');
const Experience = require('../models/experience');
const Skills = require('../models/skills');
const Settings = require('../models/settings');

// Default section order if none is saved
const DEFAULT_SECTION_ORDER = ['education', 'experience', 'skills'];

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
    console.log('Creating project with data:', req.body);
    // Ensure technologies is an array
    const projectData = {
      ...req.body,
      technologies: Array.isArray(req.body.technologies) ? req.body.technologies : []
    };
    console.log('Processed project data:', projectData);
    const project = await Project.create(projectData);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
});

router.put('/projects/:id', auth, async (req, res) => {
  try {
    console.log('Updating project with data:', req.body);
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update each field individually
    project.title = req.body.title;
    project.description = req.body.description;
    project.image = req.body.image;
    project.technologies = Array.isArray(req.body.technologies) ? req.body.technologies : [];
    
    console.log('Saving project with technologies:', project.technologies);
    await project.save();
    
    console.log('Updated project:', project);
    res.json(project);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ message: 'Error updating project', error: err.message });
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
// Education order update endpoint
router.put('/education/reorder', auth, async (req, res) => {
  try {
    const { items } = req.body;
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: index } }
      }
    }));
    await Education.bulkWrite(bulkOps);
    res.json({ message: 'Education order updated successfully' });
  } catch (err) {
    console.error('Error updating education order:', err);
    res.status(500).json({ message: 'Error updating education order' });
  }
});

router.get('/education', async (req, res) => {
  try {
    const education = await Education.find().sort('order');
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
// Experience order update endpoint
router.put('/experience/reorder', auth, async (req, res) => {
  try {
    const { items } = req.body;
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: index } }
      }
    }));
    await Experience.bulkWrite(bulkOps);
    res.json({ message: 'Experience order updated successfully' });
  } catch (err) {
    console.error('Error updating experience order:', err);
    res.status(500).json({ message: 'Error updating experience order' });
  }
});

router.get('/experience', async (req, res) => {
  try {
    const experience = await Experience.find().sort('order');
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
// Skills order update endpoint
router.put('/skills/reorder', auth, async (req, res) => {
  try {
    const { items } = req.body;
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: index } }
      }
    }));
    await Skills.bulkWrite(bulkOps);
    res.json({ message: 'Skills order updated successfully' });
  } catch (err) {
    console.error('Error updating skills order:', err);
    res.status(500).json({ message: 'Error updating skills order' });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find().sort('order');
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching skills data' });
  }
});

router.post('/skills', auth, async (req, res) => {
  try {
    const { category, items } = req.body;
    
    // Find existing category (case-insensitive)
    const existingSkills = await Skills.findOne({
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });

    if (existingSkills) {
      // Merge with existing category
      existingSkills.items = [...existingSkills.items, ...items];
      const updatedSkills = await existingSkills.save();
      res.json(updatedSkills);
    } else {
      // Create new category
      const skills = await Skills.create(req.body);
      res.status(201).json(skills);
    }
  } catch (err) {
    console.error('Error creating/updating skills:', err);
    res.status(500).json({ message: 'Error creating/updating skills entry' });
  }
});

router.put('/skills/:id', auth, async (req, res) => {
  try {
    const { category, items } = req.body;
    const id = req.params.id;

    // Find any existing category with same name but different ID
    const existingSkills = await Skills.findOne({
      _id: { $ne: id },
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });

    if (existingSkills) {
      // Merge items with existing category
      existingSkills.items = [...existingSkills.items, ...items];
      const updatedSkills = await existingSkills.save();
      
      // Delete the original category
      await Skills.findByIdAndDelete(id);
      
      res.json(updatedSkills);
    } else {
      // Update normally if no duplicate category
      const skills = await Skills.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      if (!skills) {
        return res.status(404).json({ message: 'Skills entry not found' });
      }
      res.json(skills);
    }
  } catch (err) {
    console.error('Error updating skills:', err);
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

// Get resume section order
router.get('/settings/resume-order', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'resumeSectionOrder' });
    res.json({ order: setting?.value || DEFAULT_SECTION_ORDER });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching resume section order' });
  }
});

// Update resume section order
router.post('/settings/resume-order', auth, async (req, res) => {
  try {
    console.log('Received resume order update request:', req.body);
    const { order } = req.body;
    
    if (!Array.isArray(order)) {
      console.error('Order is not an array:', order);
      return res.status(400).json({ message: 'Order must be an array' });
    }

    if (order.length !== 3) {
      console.error('Invalid order length:', order.length);
      return res.status(400).json({ message: 'Order must contain exactly 3 sections' });
    }

    const requiredSections = ['education', 'experience', 'skills'];
    const missingSection = requiredSections.find(section => !order.includes(section));
    if (missingSection) {
      console.error('Missing required section:', missingSection);
      return res.status(400).json({ message: `Missing required section: ${missingSection}` });
    }

    const result = await Settings.findOneAndUpdate(
      { key: 'resumeSectionOrder' },
      { key: 'resumeSectionOrder', value: order },
      { upsert: true, new: true }
    );

    console.log('Updated resume section order:', result);
    res.json({ message: 'Resume section order updated', order });
  } catch (err) {
    console.error('Error updating resume section order:', err);
    res.status(500).json({ 
      message: 'Error updating resume section order',
      error: err.message 
    });
  }
});

module.exports = router;
