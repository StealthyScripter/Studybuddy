import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFileDetails } from '../services/fileService';
import { startDiscussion, continueDiscussion } from '../services/aiService';

const MessageBubble = ({ message, isUser, colors }) => (
  <View style={[
    styles.messageBubble, 
    isUser ? styles.userBubble : styles.aiBubble,
    { backgroundColor: isUser ? colors.primary : colors.card }
  ]}>
    <Text style={[styles.messageText, { color: isUser ? 'white' : colors.text }]}>
      {message.content}
    </Text>
  </View>
);

const DiscussionScreen = ({ route, navigation }) => {
  const { fileId } = route.params;
  const { colors } = useTheme();
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [thinking, setThinking] = useState(false);
  const flatListRef = useRef(null);
  
  useEffect(() => {
    loadFileDetails();
  }, [fileId]);
  
  const loadFileDetails = async () => {
    try {
      setLoading(true);
      const fileData = await getFileDetails(fileId);
      if (fileData) {
        setFile(fileData);
        initializeDiscussion();
      } else {
        // Handle error
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading file details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const initializeDiscussion = async () => {
    try {
      setInitializing(true);
      
      // Add a welcome message
      const welcomeMessage = {
        id: Date.now().toString(),
        content: "I'm your AI study buddy! I'll help you understand this material better. What would you like to discuss?",
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages([welcomeMessage]);
      
      // Start a discussion based on the file content
      const response = await startDiscussion(file.uri, file.type);
      
      if (response.success) {
        const initialMessage = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          role: 'assistant',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, initialMessage]);
      }
    } catch (error) {
      console.error('Error initializing discussion:', error);
    } finally {
      setInitializing(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Prepare message history for AI (simplified for demo)
    const messageHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    try {
      setThinking(true);
      
      // Get AI response
      const response = await continueDiscussion(messageHistory, userMessage.content);
      
      if (response.success) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          role: 'assistant',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Handle error
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: "I'm having trouble processing your request. Please try again.",
          role: 'assistant',
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error in discussion:', error);
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error. Please try again.",
        role: 'assistant',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setThinking(false);
    }
  };
  
  // For the demo, we'll add some mock messages
  useEffect(() => {
    if (!initializing && messages.length <= 2 && !thinking) {
      // Add example messages for demonstration
      const mockMessages = [
        {
          id: 'mock1',
          content: "Can you explain the main concept from Chapter 3?",
          role: 'user',
          timestamp: Date.now() - 3000
        },
        {
          id: 'mock2',
          content: "In Chapter 3, the main concept is about [topic from the material]. It focuses on how [explanation of concept]. The author emphasizes [key points]. Would you like me to elaborate on any specific aspect of this concept?",
          role: 'assistant',
          timestamp: Date.now() - 2000
        }
      ];
      
      setMessages(prev => [...prev, ...mockMessages]);
    }
  }, [initializing, thinking]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <MessageBubble 
            message={item} 
            isUser={item.role === 'user'} 
            colors={colors}
          />
        )}
        contentContainerStyle={styles.messagesList}
      />
      
      {thinking && (
        <View style={[styles.thinkingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.thinkingText, { color: colors.subtext }]}>
            AI is thinking...
          </Text>
        </View>
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.subtext}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || thinking}
        >
          <MaterialCommunityIcons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  thinkingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiscussionScreen;