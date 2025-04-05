import { API_BASE_URL } from './api';

// Types based on the API specification
export interface AskQuestionRequest {
  extracted_text: string;
  question: string;
  previous_convo: string[][];
}

// Function to upload a resume/PDF file
export async function uploadResume(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
}

// Function to ask a question to the AI
export async function askQuestion(
  extractedText: string,
  question: string,
  previousConvo: string[][]
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extracted_text: extractedText,
        question: question,
        previous_convo: previousConvo,
      } as AskQuestionRequest),
    });

    if (!response.ok) {
      throw new Error(`Question request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
} 