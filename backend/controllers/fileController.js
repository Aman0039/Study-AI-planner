const UploadedFile = require('../models/UploadedFile');
const User = require('../models/User');
const { extractTextFromFile, getYouTubeTranscript, extractYouTubeId } = require('../utils/pdfParser');
const fs = require('fs');

/**
 * @route   POST /api/files/upload
 * @desc    Upload a study file
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { subject, tags } = req.body;
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const fileType = ['pdf', 'txt'].includes(ext) ? ext : 'txt';

    // Extract text from file
    let extractedData = { text: '', pageCount: 0, wordCount: 0 };
    try {
      extractedData = await extractTextFromFile(req.file.path, fileType);
    } catch (parseError) {
      console.warn('Text extraction warning:', parseError.message);
    }

    const uploadedFile = await UploadedFile.create({
      user: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText: extractedData.text,
      subject: subject || 'General',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      processingStatus: 'completed',
      metadata: {
        pageCount: extractedData.pageCount,
        wordCount: extractedData.wordCount
      }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.filesUploaded': 1 }
    });

    res.status(201).json({
      message: 'File uploaded and processed successfully!',
      file: uploadedFile
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if DB save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
};

/**
 * @route   POST /api/files/youtube
 * @desc    Add YouTube video for study
 */
const addYouTubeVideo = async (req, res) => {
  try {
    const { url, subject } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL.' });
    }

    // Fetch transcript
    let transcriptData = { text: '' };
    try {
      transcriptData = await getYouTubeTranscript(url);
    } catch (transcriptError) {
      return res.status(400).json({ error: `Could not fetch transcript: ${transcriptError.message}. Ensure the video has captions enabled.` });
    }

    const uploadedFile = await UploadedFile.create({
      user: req.user.id,
      filename: videoId,
      originalName: `YouTube: ${url}`,
      fileType: 'youtube',
      youtubeUrl: url,
      extractedText: transcriptData.text,
      subject: subject || 'General',
      processingStatus: 'completed',
      metadata: {}
    });

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.filesUploaded': 1 }
    });

    res.status(201).json({
      message: 'YouTube video processed successfully!',
      file: uploadedFile
    });
  } catch (error) {
    console.error('YouTube error:', error);
    res.status(500).json({ error: 'Failed to process YouTube video.' });
  }
};

/**
 * @route   GET /api/files
 * @desc    Get all user's files
 */
const getFiles = async (req, res) => {
  try {
    const { subject, type, page = 1, limit = 10 } = req.query;
    const query = { user: req.user.id };

    if (subject) query.subject = subject;
    if (type) query.fileType = type;

    const files = await UploadedFile.find(query)
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await UploadedFile.countDocuments(query);

    res.json({
      files,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch files.' });
  }
};

/**
 * @route   GET /api/files/:id
 * @desc    Get single file
 */
const getFile = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }
    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch file.' });
  }
};

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file
 */
const deleteFile = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({ _id: req.params.id, user: req.user.id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete physical file
    if (file.filePath && fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file.' });
  }
};

module.exports = { uploadFile, addYouTubeVideo, getFiles, getFile, deleteFile };
