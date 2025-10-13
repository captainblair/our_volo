"""
File validation utilities for user uploads.
"""

class FileValidator:
    """Utility class for validating uploaded files."""
    
    @staticmethod
    def validate_image_file(file, max_size_mb=2):
        """
        Validate an uploaded image file.
        
        Args:
            file: The uploaded file object
            max_size_mb: Maximum allowed file size in megabytes
            
        Returns:
            tuple: (is_valid, error_message)
        """
        # Check file size
        max_size_bytes = max_size_mb * 1024 * 1024
        if file.size > max_size_bytes:
            return False, f'File size should not exceed {max_size_mb}MB'
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif']
        if file.content_type not in allowed_types:
            return False, 'Only JPEG, PNG, and GIF images are allowed'
        
        return True, None
