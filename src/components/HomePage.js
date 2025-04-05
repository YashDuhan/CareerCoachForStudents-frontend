import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    // Trigger the hidden file input
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file.name); // Placeholder for actual upload logic
      // Simulate upload and redirect
      // In a real app, you'd handle the upload here (e.g., send to backend)
      // and then navigate based on the response.
      navigate('/chat'); // Redirect to chat page after selecting a file
    }
  };

  return (
    <div className="home-page container">
      <h1>Welcome to the AI Career Coach</h1>
      <p>Get personalized career advice based on your resume.</p>
      <button className="upload-button" onClick={handleUploadClick}>
        Upload Resume
      </button>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt" // Specify acceptable file types
      />
    </div>
  );
};

export default HomePage; 