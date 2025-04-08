import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Card, Title, Paragraph, Searchbar, FAB, Menu, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFilesMetadata, addFile, fileUtils } from '../services/fileService';

const LibraryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'type'
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFiles();
    });
    
    loadFiles();
    
    return unsubscribe;
  }, [navigation]);
  
  const loadFiles = async () => {
    try {
      setLoading(true);
      const filesData = await getFilesMetadata();
      setFiles(filesData);
      sortFiles(filesData, sortBy);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFile = async () => {
    try {
      setLoading(true);
      const newFile = await addFile();
      if (newFile) {
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        sortFiles(updatedFiles, sortBy);
      }
    } catch (error) {
      console.error('Error adding file:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sortFiles = (filesToSort, sortType) => {
    let sorted = [...filesToSort];
    
    switch (sortType) {
      case 'date':
        sorted.sort((a, b) => b.dateAdded - a.dateAdded);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        sorted.sort((a, b) => a.type.localeCompare(b.type));
        break;
      default:
        sorted.sort((a, b) => b.dateAdded - a.dateAdded);
    }
    
    if (searchQuery) {
      sorted = sorted.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredFiles(sorted);
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query) {
      const filtered = files.filter(file => 
        file.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFiles(filtered);
    } else {
      sortFiles(files, sortBy);
    }
  };
  
  const handleSort = (type) => {
    setSortBy(type);
    setSortMenuVisible(false);
    sortFiles(files, type);
  };
  
  const renderFileItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('FileDetails', { fileId: item.id, fileName: item.name })}
    >
      <Card style={[styles.fileCard, { backgroundColor: colors.card }]}>
        <Card.Content style={styles.fileCardContent}>
          <MaterialCommunityIcons 
            name={fileUtils.getFileIcon(item.type)} 
            size={40} 
            color={colors.primary} 
            style={styles.fileIcon}
          />
          <View style={styles.fileInfo}>
            <Title style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Title>
            <View style={styles.fileMetaContainer}>
              <View style={styles.fileMetaRow}>
                <MaterialCommunityIcons name="file-outline" size={12} color={colors.subtext} />
                <Text style={[styles.fileMetaText, { color: colors.subtext }]}>
                  {item.type.toUpperCase()}
                </Text>
              </View>
              <View style={styles.fileMetaRow}>
                <MaterialCommunityIcons name="calendar" size={12} color={colors.subtext} />
                <Text style={[styles.fileMetaText, { color: colors.subtext }]}>
                  {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.fileMetaRow}>
                <MaterialCommunityIcons name="harddisk" size={12} color={colors.subtext} />
                <Text style={[styles.fileMetaText, { color: colors.subtext }]}>
                  {fileUtils.formatFileSize(item.size)}
                </Text>
              </View>
            </View>
            <View style={styles.progressRow}>
              <View style={styles.progressContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${item.readingProgress}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.subtext }]}>
                {item.readingProgress}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons 
        name="bookshelf" 
        size={64} 
        color={colors.subtext} 
      />
      <Text style={[styles.emptyText, { color: colors.subtext }]}>
        Your library is empty
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.subtext }]}>
        Add study materials to get started
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={handleAddFile}
      >
        <Text style={styles.addButtonText}>Add Material</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search materials..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={[styles.searchbar, { backgroundColor: colors.card }]}
          iconColor={colors.primary}
          inputStyle={{ color: colors.text }}
          placeholderTextColor={colors.subtext}
        />
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={[styles.sortButton, { backgroundColor: colors.card }]}
              onPress={() => setSortMenuVisible(true)}
            >
              <MaterialCommunityIcons name="sort" size={24} color={colors.primary} />
            </TouchableOpacity>
          }
          contentStyle={{ backgroundColor: colors.card }}
        >
          <Menu.Item 
            onPress={() => handleSort('date')} 
            title="Sort by Date" 
            titleStyle={{ color: colors.text }}
            icon={({ size, color }) => (
              <MaterialCommunityIcons 
                name="calendar" 
                size={size} 
                color={sortBy === 'date' ? colors.primary : colors.text} 
              />
            )}
          />
          <Divider />
          <Menu.Item 
            onPress={() => handleSort('name')} 
            title="Sort by Name" 
            titleStyle={{ color: colors.text }}
            icon={({ size, color }) => (
              <MaterialCommunityIcons 
                name="sort-alphabetical-ascending" 
                size={size} 
                color={sortBy === 'name' ? colors.primary : colors.text} 
              />
            )}
          />
          <Divider />
          <Menu.Item 
            onPress={() => handleSort('type')} 
            title="Sort by Type" 
            titleStyle={{ color: colors.text }}
            icon={({ size, color }) => (
              <MaterialCommunityIcons 
                name="file-document-outline" 
                size={size} 
                color={sortBy === 'type' ? colors.primary : colors.text} 
              />
            )}
          />
        </Menu>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredFiles}
          renderItem={renderFileItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: colors.primary }]}
        icon="plus"
        onPress={handleAddFile}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
  },
  sortButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // To avoid FAB overlap
  },
  fileCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  fileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    marginBottom: 4,
  },
  fileMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  fileMetaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LibraryScreen;