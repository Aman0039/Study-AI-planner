const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return {
      text: data.text,
      pageCount: data.numpages,
      wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Extract text from a TXT file
 */
const extractTextFromTXT = (filePath) => {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    return {
      text,
      pageCount: 1,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length
    };
  } catch (error) {
    throw new Error(`Failed to read TXT file: ${error.message}`);
  }
};

/**
 * Extract text based on file type
 */
const extractTextFromFile = async (filePath, fileType) => {
  const ext = fileType || path.extname(filePath).toLowerCase().replace('.', '');

  switch (ext) {
    case 'pdf':
      return await extractTextFromPDF(filePath);
    case 'txt':
      return extractTextFromTXT(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Extract YouTube video ID from URL
 */
const extractYouTubeId = (url) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

/**
 * Get YouTube transcript
 */
const getYouTubeTranscript = async (videoUrl) => {
  const { YoutubeTranscript } = require('youtube-transcript');
  const videoId = extractYouTubeId(videoUrl);

  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map(item => item.text).join(' ');
    return {
      text,
      videoId,
      segments: transcript
    };
  } catch (error) {
    throw new Error(`Failed to fetch YouTube transcript: ${error.message}`);
  }
};

module.exports = {
  extractTextFromFile,
  extractTextFromPDF,
  extractTextFromTXT,
  getYouTubeTranscript,
  extractYouTubeId
};
