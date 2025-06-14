const express = require('express');
const router = express.Router();
const Blog = require('../model/Blog');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, TextRun } = require('docx');

// POST /blogs/create - Create a new blog
router.post('/create', async (req, res) => {
  try {
    const { title, content } = req.body;
    const newBlog = new Blog({ title, content });
    await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// GET /blogs - Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// 🔍 GET /blogs/search?q=keyword - Search blog posts
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const results = await Blog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// PUT /blogs/update/:id - Update a blog post
router.put('/update/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json({ message: 'Blog updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// DELETE /blogs/:id - Delete a blog by ID
router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// ✅ GET /blogs/export - Export blogs to Excel
router.get('/export', async (req, res) => {
  try {
    const blogs = await Blog.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Blog Posts');

    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Content', key: 'content', width: 50 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    blogs.forEach(blog => {
      worksheet.addRow({
        title: blog.title,
        content: blog.content,
        createdAt: blog.createdAt.toISOString().split('T')[0],
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=blogs.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to export blogs' });
  }
});

// ✅ GET /blogs/export-word - Export blogs to Word
router.get('/export-word', async (req, res) => {
  try {
    const blogs = await Blog.find();

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: blogs.flatMap(blog => [
            new Paragraph({
              children: [
                new TextRun({ text: blog.title, bold: true, size: 28 }),
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: blog.content, size: 24 }),
              ],
              spacing: { after: 200 }
            })
          ])
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = 'blogs.docx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: 'Failed to export blogs to Word' });
  }
});

module.exports = router;
