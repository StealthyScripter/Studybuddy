import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFilesMetadata } from '../services/fileService';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [recentFiles, setRecentFiles] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    studyTime: 0,
    quizzesTaken: 0,
    averageScore: 0
  });
  
  useEffect(() => {
    // Load recent files and stats
    loadData();
    
    // Refresh on focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const loadData = async () => {
    try {
      // Get files and sort by last accessed
      const files = await getFilesMetadata();
      
      // Set recent files (up to 5)
      const sorted = [...files].sort((a, b) => b.lastAccessed - a.lastAccessed);
      setRecentFiles(sorted.slice(0, 5));
      
      // Calculate stats
      const total = files.length;
      let studyTime = 0;
      let quizzes = 0;
      let totalScore = 0;
      
      files.forEach(file => {
        // Add estimated study time (simplified for demo)
        studyTime += file.readingProgress * 10; // 10 minutes per % progress
        
        // Count quizzes and scores
        if (file.quizScores && file.quizScores.length > 0) {
          quizzes += file.quizScores.length;
          totalScore += file.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
        }
      });
      
      setStats({
        totalFiles: total,
        studyTime: Math.round(studyTime),
        quizzesTaken: quizzes,
        averageScore: quizzes > 0 ? Math.round(totalScore / quizzes) : 0
      });
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };
  
  const getFileIcon = (fileType) => {
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
  };
  
  const renderRecentFiles = () => {
    if (recentFiles.length === 0) {
      return (
        <Card style={[styles.emptyCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.emptyCardContent}>
            <MaterialCommunityIcons name="file-plus" size={40} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No files yet. Add study materials to get started.
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Library')}
            >
              <Text style={styles.addButtonText}>Add Materials</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      );
    }
    
    return recentFiles.map(file => (
      <TouchableOpacity
        key={file.id}
        onPress={() => navigation.navigate('FileDetails', { fileId: file.id, fileName: file.name })}
      >
        <Card style={[styles.fileCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.fileCardContent}>
            <MaterialCommunityIcons 
              name={getFileIcon(file.type)} 
              size={36} 
              color={colors.primary} 
              style={styles.fileIcon}
            />
            <View style={styles.fileInfo}>
              <Title style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                {file.name}
              </Title>
              <View style={styles.fileMetaRow}>
                <Paragraph style={[styles.fileMetaText, { color: colors.subtext }]}>
                  {new Date(file.lastAccessed).toLocaleDateString()}
                </Paragraph>
                <View style={styles.progressContainer}>
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
                <Text style={[styles.progressText, { color: colors.subtext }]}>
                  {file.readingProgress}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    ));
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeTextContainer}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Study Buddy
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.subtext }]}>
            Your AI-powered learning assistant
          </Text>
        </View>
      </View>
      
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalFiles}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Materials</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.studyTime}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Minutes</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.quizzesTaken}</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Quizzes</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.averageScore}%</Text>
          <Text style={[styles.statLabel, { color: colors.subtext }]}>Avg. Score</Text>
        </View>
      </View>
      
      {/* Recent Files Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Materials</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Library')}>
            <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.filesContainer}>
          {renderRecentFiles()}
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        </View>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Library')}
          >
            <MaterialCommunityIcons name="file-upload-outline" size={28} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Add Material</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Study')}
          >
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Study Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('QuizScreen')}
          >
            <MaterialCommunityIcons name="head-question" size={28} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Practice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Performance')}
          >
            <MaterialCommunityIcons name="chart-bar" size={28} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
  },
  filesContainer: {
    marginBottom: 8,
  },
  fileCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  fileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileMetaText: {
    fontSize: 12,
    marginRight: 8,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginLeft: 8,
  },
  emptyCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    padding: 24,
  },
  emptyCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    marginTop: 8,
    fontWeight: '500',
  },
});

export default HomeScreen;