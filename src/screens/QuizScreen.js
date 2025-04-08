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
import { Card, Button, RadioButton, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFileDetails } from '../services/fileService';
import { generateQuestions, addQuizScore } from '../services/aiService';

// Mock questions for demonstration
const MOCK_QUESTIONS = [
  {
    id: '1',
    question: 'What is the primary focus of Chapter 2 in the material?',
    options: [
      'Historical context of the topic',
      'Theoretical foundations',
      'Practical applications',
      'Future developments'
    ],
    answer: 1, // Index of correct answer
    explanation: 'The theoretical foundations are the primary focus of Chapter 2, which lays out the fundamental concepts and principles that will be built upon in later chapters.'
  },
  {
    id: '2',
    question: 'Which of the following best describes the relationship between concepts A and B as explained in the material?',
    options: [
      'A is a subset of B',
      'B is derived from A',
      'A and B are complementary',
      'A and B are contradictory'
    ],
    answer: 2,
    explanation: 'As explained in the text, concepts A and B work together in complementary ways, each addressing different aspects of the same phenomenon.'
  },
  {
    id: '3',
    question: 'According to the material, what is the most significant limitation of the approach described in Section 4.3?',
    options: [
      'It requires specialized equipment',
      'It\'s computationally expensive',
      'It only works under specific conditions',
      'It doesn\'t scale well to large datasets'
    ],
    answer: 3,
    explanation: 'The material explicitly states that the main drawback of this approach is its poor scaling characteristics when applied to large datasets.'
  },
  {
    id: '4',
    question: 'Which of these terms is NOT defined in the glossary of the material?',
    options: [
      'Term X',
      'Term Y',
      'Term Z',
      'Term W'
    ],
    answer: 3,
    explanation: 'Terms X, Y, and W all appear in the glossary with their definitions, but Term Z is not defined anywhere in the material.'
  },
  {
    id: '5',
    question: 'What conclusion does the author draw in the final chapter?',
    options: [
      'More research is needed',
      'The theory has been proven conclusively',
      'Alternative approaches may be more effective',
      'Practical applications are immediately viable'
    ],
    answer: 0,
    explanation: 'In the conclusion, the author emphasizes that while progress has been made, significant questions remain and more research is needed to fully understand the implications.'
  }
];

const QuizScreen = ({ route, navigation }) => {
  const { fileId } = route.params;
  const { colors } = useTheme();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  useEffect(() => {
    loadFileDetails();
  }, [fileId]);
  
  const loadFileDetails = async () => {
    try {
      setLoading(true);
      const fileData = await getFileDetails(fileId);
      if (fileData) {
        setFile(fileData);
        // In a real app, we would generate questions from the AI here
        // For demo, we'll use mock questions
        setQuestions(MOCK_QUESTIONS);
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
  
  const handleSelectOption = (index) => {
    if (!showAnswer) {
      setSelectedOption(index);
    }
  };
  
  const handleCheckAnswer = () => {
    if (selectedOption === null) {
      Alert.alert('Select an option', 'Please select an answer before checking.');
      return;
    }
    
    setShowAnswer(true);
    
    // Store the answer
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedOption,
        isCorrect: selectedOption === currentQuestion.answer
      }
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowAnswer(false);
    } else {
      // Quiz completed
      completeQuiz();
    }
  };
  
  const completeQuiz = () => {
    // Calculate score
    const totalQuestions = questions.length;
    const correctAnswers = Object.values(answers).filter(a => a.isCorrect).length;
    const percentageScore = Math.round((correctAnswers / totalQuestions) * 100);
    
    setScore(percentageScore);
    setQuizCompleted(true);
    
    // In a real app, save the score to the file metadata
    // addQuizScore(fileId, percentageScore);
  };
  
  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setAnswers({});
    setQuizCompleted(false);
  };
  
  const handleNewQuiz = () => {
    // In a real app, this would generate new questions
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setAnswers({});
    setQuizCompleted(false);
    
    // For demo, we'll just shuffle the existing questions
    setQuestions([...questions].sort(() => Math.random() - 0.5));
  };
  
  const renderQuizContent = () => {
    if (quizCompleted) {
      return renderQuizResults();
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <View style={styles.quizContainer}>
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <ProgressBar
            progress={(currentQuestionIndex + 1) / questions.length}
            color={colors.primary}
            style={styles.progressBar}
          />
        </View>
        
        {/* Question */}
        <Card style={[styles.questionCard, { backgroundColor: colors.card }]}>
          <Card.Content>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {currentQuestion.question}
            </Text>
            
            {/* Options */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index && styles.selectedOption,
                    showAnswer && index === currentQuestion.answer && styles.correctOption,
                    showAnswer && selectedOption === index && selectedOption !== currentQuestion.answer && styles.incorrectOption,
                    { 
                      backgroundColor: colors.background,
                      borderColor: 
                        showAnswer && index === currentQuestion.answer ? colors.success :
                        showAnswer && selectedOption === index ? colors.error :
                        selectedOption === index ? colors.primary :
                        colors.border
                    }
                  ]}
                  onPress={() => handleSelectOption(index)}
                  disabled={showAnswer}
                >
                  <RadioButton
                    value={index.toString()}
                    status={selectedOption === index ? 'checked' : 'unchecked'}
                    color={
                      showAnswer && index === currentQuestion.answer ? colors.success :
                      showAnswer && selectedOption === index ? colors.error :
                      colors.primary
                    }
                    disabled={showAnswer}
                    onPress={() => handleSelectOption(index)}
                  />
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: colors.text,
                      fontWeight: showAnswer && index === currentQuestion.answer ? 'bold' : 'normal' 
                    }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Explanation (visible after answering) */}
            {showAnswer && (
              <View style={[styles.explanationContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.explanationTitle, { color: colors.primary }]}>
                  Explanation:
                </Text>
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        {/* Action buttons */}
        <View style={styles.actionContainer}>
          {!showAnswer ? (
            <Button
              mode="contained"
              onPress={handleCheckAnswer}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              disabled={selectedOption === null}
            >
              Check Answer
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNextQuestion}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Button>
          )}
        </View>
      </View>
    );
  };
  
  const renderQuizResults = () => {
    return (
      <View style={styles.resultsContainer}>
        <Card style={[styles.resultsCard, { backgroundColor: colors.card }]}>
          <Card.Content style={styles.resultsContent}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreText}>{score}%</Text>
            </View>
            
            <Text style={[styles.resultsTitleText, { color: colors.text }]}>
              Quiz Completed!
            </Text>
            
            <Text style={[styles.resultsSubtitleText, { color: colors.subtext }]}>
              You answered {Object.values(answers).filter(a => a.isCorrect).length} out of {questions.length} questions correctly.
            </Text>
            
            <View style={styles.resultsActions}>
              <Button
                mode="contained"
                onPress={handleRetakeQuiz}
                style={[styles.resultsButton, { backgroundColor: colors.primary }]}
              >
                Retake Quiz
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleNewQuiz}
                style={styles.resultsButton}
                color={colors.primary}
              >
                New Quiz
              </Button>
              
              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                style={styles.resultsButton}
                color={colors.primary}
              >
                Back to Study
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Question summary */}
        <View style={styles.summarySectionContainer}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Question Summary
          </Text>
          
          <ScrollView style={styles.summaryContainer}>
            {questions.map((question, index) => {
              const answer = answers[question.id];
              const isCorrect = answer?.isCorrect || false;
              
              return (
                <View 
                  key={question.id} 
                  style={[
                    styles.summaryItem, 
                    { 
                      backgroundColor: colors.card,
                      borderLeftColor: isCorrect ? colors.success : colors.error,
                    }
                  ]}
                >
                  <View style={styles.summaryItemHeader}>
                    <Text style={[styles.summaryItemNumber, { color: colors.subtext }]}>
                      Q{index + 1}
                    </Text>
                    <View style={styles.summaryItemResult}>
                      <MaterialCommunityIcons 
                        name={isCorrect ? 'check-circle' : 'close-circle'} 
                        size={16} 
                        color={isCorrect ? colors.success : colors.error} 
                      />
                      <Text 
                        style={[
                          styles.summaryItemResultText, 
                          { color: isCorrect ? colors.success : colors.error }
                        ]}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.summaryItemQuestion, { color: colors.text }]}>
                    {question.question}
                  </Text>
                  
                  <View style={styles.summaryItemAnswers}>
                    <Text style={[styles.summaryItemAnswerLabel, { color: colors.subtext }]}>
                      Your answer: 
                    </Text>
                    <Text style={[styles.summaryItemAnswer, { color: isCorrect ? colors.success : colors.error }]}>
                      {question.options[answer?.selectedOption || 0]}
                    </Text>
                  </View>
                  
                  {!isCorrect && (
                    <View style={styles.summaryItemAnswers}>
                      <Text style={[styles.summaryItemAnswerLabel, { color: colors.subtext }]}>
                        Correct answer: 
                      </Text>
                      <Text style={[styles.summaryItemAnswer, { color: colors.success }]}>
                        {question.options[question.answer]}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (generatingQuiz) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Generating quiz questions...
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderQuizContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  quizContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  questionCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  selectedOption: {
    borderWidth: 2,
  },
  correctOption: {
    borderWidth: 2,
  },
  incorrectOption: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  explanationContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    borderRadius: 8,
  },
  
  // Results styles
  resultsContainer: {
    flex: 1,
  },
  resultsCard: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  resultsContent: {
    alignItems: 'center',
    padding: 8,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  resultsTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsSubtitleText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  resultsActions: {
    width: '100%',
  },
  resultsButton: {
    marginBottom: 12,
    width: '100%',
  },
  
  // Summary styles
  summarySectionContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryContainer: {
    flex: 1,
  },
  summaryItem: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  summaryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryItemResult: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemResultText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  summaryItemQuestion: {
    fontSize: 16,
    marginBottom: 8,
  },
  summaryItemAnswers: {
    flexDirection: 'row',
    marginTop: 4,
  },
  summaryItemAnswerLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  summaryItemAnswer: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default QuizScreen;