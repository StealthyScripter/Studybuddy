import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'studyBuddy_files';
const BASE_DIR = FileSystem.documentDirectory + 'study_materials/';

// Ensure directory exists
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(BASE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BASE_DIR, { intermediates: true });
  }
};

// Initialize file storage
export const initializeFileStorage = async () => {
  await ensureDirectoryExists();
};

// Get all saved file metadata
export const getFilesMetadata = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading files metadata:', error);
    return [];
  }
};

// Save file metadata
const saveFilesMetadata = async (files) => {
  try {
    const jsonValue = JSON.stringify(files);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving files metadata:', error);
  }
};

// Add file
export const addFile = async () => {
  try {
    // Pick document
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      copyToCacheDirectory: true
    });
    
    if (result.type === 'cancel') {
      return null;
    }
    
    await ensureDirectoryExists();
    
    // Create unique filename to prevent conflicts
    const timestamp = new Date().getTime();
    const fileExtension = result.name.split('.').pop();
    const uniqueFileName = `${timestamp}.${fileExtension}`;
    const localUri = BASE_DIR + uniqueFileName;
    
    // Copy file to app's storage
    await FileSystem.copyAsync({
      from: result.uri,
      to: localUri
    });
    
    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    // Create file metadata
    const newFile = {
      id: timestamp.toString(),
      name: result.name,
      type: fileExtension,
      size: fileInfo.size,
      dateAdded: timestamp,
      uri: localUri,
      lastAccessed: timestamp,
      tags: [],
      notes: '',
      isStarred: false,
      quizScores: [],
      readingProgress: 0
    };
    
    // Update metadata store
    const existingFiles = await getFilesMetadata();
    const updatedFiles = [...existingFiles, newFile];
    await saveFilesMetadata(updatedFiles);
    
    return newFile;
  } catch (error) {
    console.error('Error adding file:', error);
    return null;
  }
};

// Get file details
export const getFileDetails = async (fileId) => {
  try {
    const files = await getFilesMetadata();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      throw new Error('File not found');
    }
    
    // Update last accessed time
    file.lastAccessed = new Date().getTime();
    await saveFilesMetadata(files);
    
    return file;
  } catch (error) {
    console.error('Error getting file details:', error);
    return null;
  }
};

// Update file metadata
export const updateFileMetadata = async (fileId, updates) => {
  try {
    const files = await getFilesMetadata();
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    
    // Update file with new data
    files[fileIndex] = { ...files[fileIndex], ...updates };
    await saveFilesMetadata(files);
    
    return files[fileIndex];
  } catch (error) {
    console.error('Error updating file metadata:', error);
    return null;
  }
};

// Delete file
export const deleteFile = async (fileId) => {
  try {
    const files = await getFilesMetadata();
    const file = files.find(f => f.id === fileId);
    
    if (!file) {
      throw new Error('File not found');
    }
    
    // Remove file from filesystem
    await FileSystem.deleteAsync(file.uri);
    
    // Remove from metadata
    const updatedFiles = files.filter(f => f.id !== fileId);
    await saveFilesMetadata(updatedFiles);
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Update reading progress
export const updateReadingProgress = async (fileId, progress) => {
  return await updateFileMetadata(fileId, { readingProgress: progress });
};

// Add quiz score
export const addQuizScore = async (fileId, score) => {
  try {
    const files = await getFilesMetadata();
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    
    const quizScores = [...files[fileIndex].quizScores, {
      date: new Date().getTime(),
      score: score
    }];
    
    files[fileIndex] = { ...files[fileIndex], quizScores };
    await saveFilesMetadata(files);
    
    return files[fileIndex];
  } catch (error) {
    console.error('Error adding quiz score:', error);
    return null;
  }
};

// Get file content
export const getFileContent = async (fileUri) => {
  try {
    // For PDF we can only get the URI to pass to a PDF viewer
    // For DOCX and PPTX, proper parsing would need additional libraries
    return fileUri;
  } catch (error) {
    console.error('Error getting file content:', error);
    return null;
  }
};

// Utils for file handling
export const fileUtils = {
  getFileIcon: (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'file-pdf-box';
      case 'docx':
        return 'file-word-box';
      case 'pptx':
        return 'file-powerpoint-box';
      default:
        return 'file-document';
    }
  },
  
  formatFileSize: (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }
};