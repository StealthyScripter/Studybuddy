import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Card, Title, Paragraph, Menu, Divider, FAB, Portal, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFileDetails, deleteFile, updateFileMetadata } from '../services/fileService';
import Pdf from 'react-native-pdf';

// Mock implementation for demo purposes
const FileContent = ({ file, colors }) => {
  if (!file) return null;
  
  // For PDF files
  if (file.type === 'pdf') {
    return (
      <View style={styles.pdfContainer}>
        <Text style={[styles.mockText, { color: colors.subtext }]}>
          [PDF Viewer would be displayed here]
        </Text>
      </View>
    );
  }
  
  // For DOCX files
  if (file.type === 'docx') {
    return (
      <View style={styles.docContainer}>
        <Text style={[styles.mockText, { color: colors.subtext }]}>
          [DOCX Viewer would be displayed here]
        </Text>
      </View>
    );
  }
  
  // For PPTX files
  if (file.type === 'pptx') {
    return (
      <View style={styles.pptContainer}>
        <Text style={[styles.mockText, { color: colors.subtext }]}>
          [PPTX Viewer would be displayed here]
        </Text>
      </View>
    );
  }
  
  // Fallback
  return (
    <View style={styles.genericContainer}>
      <Text style={[styles.mockText, { color: colors.subtext }]}>
        [File viewer for {file.type} would be displayed here]
      </Text>
    </View>
  );
};

const FileDetailsScreen = ({ route, navigation }) => {
  const { fileId } = route.params;
  const { colors } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  useEffect(() => {
    loadFileDetails();
  }, [fileId]);
  
  const loadFileDetails = async () => {
    try {
      setLoading(true);
      const fileData = await getFileDetails(fileId);
      if (fileData) {
        setFile(fileData);
        navigation.setOptions({ title: fileData.name });
      } else {
        Alert.alert('Error', 'File not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading file details:', error);
      Alert.alert('Error', 'Could not load file details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteFile = () => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await deleteFile(fileId);
              if (success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Could not delete file');
              }
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Could not delete file');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const toggleStarred = async () => {
    try {
      const updated = await updateFileMetadata(fileId, { isStarred: !file.isStarred });
      if (updated) {
        setFile(updated);
      }
    } catch (error) {
      console.error('Error updating star status:', error);
    }
  };
  
  const handleAudiobook = () => {
    setFabOpen(false);
    navigation.navigate('AudioPlayer', { fileId });
  };
  
  const handleQuiz = () => {
    setFabOpen(false);
    navigation.navigate('Quiz', { fileId });
  };
  
  const handleDiscussion = () => {
    setFabOpen(false);
    navigation.navigate('Discussion', { fileId });
  };
  
  const handlePerformance = () => {
    setFabOpen(false);
    navigation.navigate('Performance', { fileId });
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!file) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>File not found</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* File Info Header */}
      <Card style={[styles.fileInfoCard, { backgroundColor: colors.card }]}>
        <Card.Content>
          <View style={styles.fileHeaderRow}>
            <View style={styles.fileTypeIconContainer}>
              <MaterialCommunityIcons 
                name={
                  file.type === 'pdf' ? 'file-pdf-box' : 
                  file.type === 'docx' ? 'file-word-box' : 
                  file.type === 'pptx' ? 'file-powerpoint-box' : 
                  'file-document'
                } 
                size={36} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.fileInfoContainer}>
              <Title style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                {file.name}
              </Title>
              <View style={styles.fileMetaRow}>
                <Text style={[styles.fileMetaText, { color: colors.subtext }]}>
                  Added: {new Date(file.dateAdded).toLocaleDateString()}
                </Text>
                <Text style={[styles.fileMetaText, { color: colors.subtext }]}>
                  Type: {file.type.toUpperCase()}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.starButton} 
              onPress={toggleStarred}
            >
              <MaterialCommunityIcons 
                name={file.isStarred ? 'star' : 'star-outline'} 
                size={24} 
                color={file.isStarred ? colors.accent : colors.subtext} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <MaterialCommunityIcons 
                name="dots-vertical" 
                size={24} 
                color={colors.subtext} 
              />
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={styles.menuAnchor}
                contentStyle={{ backgroundColor: colors.card }}
              >
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    // Add rename functionality here
                  }} 
                  title="Rename" 
                  titleStyle={{ color: colors.text }}
                  icon="pencil"
                />
                <Divider />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    // Add share functionality here
                  }} 
                  title="Share" 
                  titleStyle={{ color: colors.text }}
                  icon="share-variant"
                />
                <Divider />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    handleDeleteFile();
                  }} 
                  title="Delete" 
                  titleStyle={{ color: colors.error }}
                  icon={({ size }) => (
                    <MaterialCommunityIcons name="delete" color={colors.error} size={size} />
                  )}
                />
              </Menu>
            </TouchableOpacity>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>
                Reading Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: colors.text }]}>
                {file.readingProgress}%
              </Text>
            </View>
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: colors.primary,
                    width: `${file.readingProgress}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* File Content */}
      <View style={styles.contentContainer}>
        <FileContent file={file} colors={colors} />
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={handleAudiobook}
          >
            <MaterialCommunityIcons name="headphones" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Audiobook
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={handleQuiz}
          >
            <MaterialCommunityIcons name="help-circle" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Quiz
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={handleDiscussion}
          >
            <MaterialCommunityIcons name="chat" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Discuss
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={handlePerformance}
          >
            <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: colors.card }]}
            onPress={() => {
              // Add notes functionality here
            }}
          >
            <MaterialCommunityIcons name="note-text" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Notes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Floating Action Button */}
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? 'close' : 'lightbulb-on'}
          color="white"
          fabStyle={{ backgroundColor: colors.primary }}
          actions={[
            {
              icon: 'headphones',
              label: 'Create Audiobook',
              onPress: handleAudiobook,
              color: colors.text,
              style: { backgroundColor: colors.card },
              labelStyle: { color: colors.text },
            },
            {
              icon: 'chat-question',
              label: 'Generate Quiz',
              onPress: handleQuiz,
              color: colors.text,
              style: { backgroundColor: colors.card },
              labelStyle: { color: colors.text },
            },
            {
              icon: 'chat-processing',
              label: 'Start Discussion',
              onPress: handleDiscussion,
              color: colors.text,
              style: { backgroundColor: colors.card },
              labelStyle: { color: colors.text },
            },
            {
              icon: 'note-text-outline',
              label: 'Create Study Notes',
              onPress: () => {
                setFabOpen(false);
                // Add study notes functionality here
              },
              color: colors.text,
              style: { backgroundColor: colors.card },
              labelStyle: { color: colors.text },
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
        />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fileInfoCard: {
    borderRadius: 0,
    elevation: 4,
  },
  fileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileTypeIconContainer: {
    marginRight: 12,
  },
  fileInfoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
  },
  fileMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fileMetaText: {
    fontSize: 12,
    marginRight: 8,
  },
  starButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  menuAnchor: {
    margin: 0,
    padding: 0,
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  quickActionsContainer: {
    padding: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
  },
  quickActionText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  
  // Mock containers for file viewers
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
  },
  docContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
  },
  pptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
  },
  genericContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
  },
  mockText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FileDetailsScreen;