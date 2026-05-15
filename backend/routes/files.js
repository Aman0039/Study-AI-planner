const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile, addYouTubeVideo, getFiles, getFile, deleteFile } = require('../controllers/fileController');

router.use(protect);
router.post('/upload', upload.single('file'), uploadFile);
router.post('/youtube', addYouTubeVideo);
router.get('/', getFiles);
router.get('/:id', getFile);
router.delete('/:id', deleteFile);

module.exports = router;
