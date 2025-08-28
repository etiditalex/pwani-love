const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Upload profile photos
router.post('/profile-photos', authenticateToken, upload.array('photos', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedPhotos = [];
    const errors = [];

    // Upload each file to Cloudinary
    for (const file of req.files) {
      try {
        // Convert buffer to base64
        const base64String = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64String}`;

        // Upload to Cloudinary with optimization
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'pwani-love/profile-photos',
          transformation: [
            { width: 800, height: 800, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `${req.user.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        uploadedPhotos.push({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format
        });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    }

    if (uploadedPhotos.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to upload any photos',
        details: errors 
      });
    }

    res.json({
      message: `Successfully uploaded ${uploadedPhotos.length} photos`,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Profile photos upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile photos' });
  }
});

// Upload chat media (images, videos)
router.post('/chat-media/:matchId', authenticateToken, upload.array('media', 5), async (req, res) => {
  try {
    const { matchId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedMedia = [];
    const errors = [];

    // Upload each file to Cloudinary
    for (const file of req.files) {
      try {
        // Convert buffer to base64
        const base64String = file.buffer.toString('base64');
        const dataURI = `data:${file.mimetype};base64,${base64String}`;

        // Determine if it's a video or image
        const isVideo = file.mimetype.startsWith('video/');
        
        const uploadOptions = {
          folder: `pwani-love/chat-media/${matchId}`,
          public_id: `${req.user.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: isVideo ? 'video' : 'image'
        };

        // Add transformations based on media type
        if (isVideo) {
          uploadOptions.transformation = [
            { width: 480, height: 360, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ];
        } else {
          uploadOptions.transformation = [
            { width: 600, height: 600, crop: 'fill' },
            { quality: 'auto', fetch_format: 'auto' }
          ];
        }

        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

        uploadedMedia.push({
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? 'video' : 'image',
          width: result.width,
          height: result.height,
          format: result.format,
          duration: result.duration // for videos
        });
      } catch (error) {
        console.error('Chat media upload error:', error);
        errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
      }
    }

    if (uploadedMedia.length === 0) {
      return res.status(500).json({ 
        error: 'Failed to upload any media',
        details: errors 
      });
    }

    res.json({
      message: `Successfully uploaded ${uploadedMedia.length} media files`,
      media: uploadedMedia,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Chat media upload error:', error);
    res.status(500).json({ error: 'Failed to upload chat media' });
  }
});

// Delete uploaded media
router.delete('/delete/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ message: 'Media deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete media' });
    }

  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Get upload progress (for large files)
router.get('/progress/:uploadId', authenticateToken, (req, res) => {
  // This would typically integrate with a progress tracking system
  // For now, return a simple response
  res.json({ 
    progress: 100, 
    status: 'completed' 
  });
});

// Validate image before upload
router.post('/validate', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size too large (max 10MB)' });
    }

    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }

    // Basic validation passed
    res.json({
      valid: true,
      file: {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    });

  } catch (error) {
    console.error('File validation error:', error);
    res.status(500).json({ error: 'File validation failed' });
  }
});

// Generate signed upload URL (for direct uploads)
router.post('/signed-url', authenticateToken, async (req, res) => {
  try {
    const { folder = 'pwani-love/uploads', publicId } = req.body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId || `${req.user.uid}_${timestamp}`
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId: publicId || `${req.user.uid}_${timestamp}`
    });

  } catch (error) {
    console.error('Signed URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files (max 5)' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: error.message });
  }

  console.error('Upload error:', error);
  res.status(500).json({ error: 'Upload failed' });
});

module.exports = router;
