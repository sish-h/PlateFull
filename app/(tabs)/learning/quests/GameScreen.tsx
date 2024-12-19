// src/screens/GameScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { colors } from '../../../../constants/colors';
import ActionButton from '../components/ActionButton';
import ProgressBar from '../components/ProgressBar';
import StatItem from '../components/StatItem';
import QUIZ_DATA from '../data/quizData';
import { RootStackParamList } from '../types/navigation';

type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GameScreen = ({ navigation, route }: GameScreenProps) => {
  const { difficulty, questions: subRoundQuestions } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0); // Legacy state, keeping for compatibility
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [hearts, setHearts] = useState(5);
  const [stars, setStars] = useState(100);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [shakeAnim] = useState(new Animated.Value(0));

  // Process questions based on difficulty
  const processQuestions = useCallback(() => {
    // Use specific sub-round questions if provided, otherwise fallback to random
    if (subRoundQuestions && subRoundQuestions.length > 0) {
      return [...subRoundQuestions];
    }
    
    // Fallback: Flatten all categories into one array
    const allQuestions = Object.values(QUIZ_DATA).flat();
    
    // Filter by difficulty if needed, or just shuffle
    let filteredQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    
    // Always 10 questions per sub-round
    const questionCount = 10;
    
    return filteredQuestions.slice(0, questionCount);
  }, [difficulty, subRoundQuestions]);

  // Load questions when component mounts or difficulty changes
  useEffect(() => {
    const loadedQuestions = processQuestions();
    setQuestions(loadedQuestions);
    setCurrentQuestion(0);
    setScore(0);
    setCorrectAnswers(0);
    setHintsUsedCount(0);
    setHearts(5);
    setStars(100);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setHintUsed(false);
    setHintText('');
  }, [difficulty, processQuestions]);

  // Animation for correct/incorrect answers
  const animateFeedback = (isCorrect: boolean) => {
    const toValue = isCorrect ? 1 : 0;
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Shake animation for wrong answer
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct_index;
    
    setSelectedAnswer(answerIndex);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      Vibration.vibrate(100);
      animateFeedback(true);
    } else {
      shake();
      Vibration.vibrate([0, 50, 100, 50]);
    }

    // Move to next question or end sub-round
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        // Move to next question
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setHintUsed(false);
        setHintText('');
      } else {
        // End of sub-round - calculate final results
        handleSubRoundComplete(isCorrect);
      }
    }, 1500);
  };

  const handleSubRoundComplete = (isLastAnswerCorrect: boolean) => {
    // Count final correct answers (including the last one if correct)
    const finalCorrectAnswers = correctAnswers + (isLastAnswerCorrect ? 1 : 0);
    
    // Calculate final score: correct answers - hint penalties (1 point per hint used)
    const finalScore = finalCorrectAnswers - hintsUsedCount;
    
    // Determine pass/fail (need > 8 points to pass)
    const passed = finalScore > 8;
    
    // Calculate stars based on final score
    let starsEarned = 0;
    if (finalScore < 5) starsEarned = 0; // Poor...
    else if (finalScore >= 5 && finalScore <= 6) starsEarned = 1; // Try hard!
    else if (finalScore >= 7 && finalScore <= 8) starsEarned = 2; // Good
    else if (finalScore >= 9) starsEarned = 3; // Wonderful!
    
    // If failed, decrease hearts
    if (!passed) {
      setHearts(prev => {
        const newHearts = prev - 1;
        if (newHearts <= 0) {
          // No more hearts - show results but indicate cannot retry
          navigation.navigate('Results', {
            score: finalScore,
            totalQuestions: questions.length,
            starsEarned: 0, // No stars if no hearts left
            isSubRoundComplete: false,
            isRoundComplete: false,
            isLevelComplete: false
          });
          return 0;
        }
        // Still have hearts, show failed results
        navigation.navigate('Results', {
          score: finalScore,
          totalQuestions: questions.length,
          starsEarned: 0, // No stars for failing
          isSubRoundComplete: false,
          isRoundComplete: false,
          isLevelComplete: false
        });
        return newHearts;
      });
    } else {
      // Passed - show success results
      navigation.navigate('Results', {
        score: finalScore,
        totalQuestions: questions.length,
        starsEarned,
        isSubRoundComplete: true,
        isRoundComplete: false, // This will be determined by the quest system
        isLevelComplete: false
      });
    }
  };

  const useHint = () => {
    if (hintUsed || stars < 10 || selectedAnswer !== null) return;
    
    setHintUsed(true);
    setHintsUsedCount(prev => prev + 1); // Track hint usage for scoring
    setStars(prev => prev - 10);
    
    const currentQ = questions[currentQuestion];
    const hintOptions = [
      `The answer starts with "${currentQ.correct_answer[0]}"`,
      `The answer is ${currentQ.correct_answer.length} words long`,
      `The answer is about ${currentQ.correct_answer.split(' ')[0]}`,
      `Think about ${currentQ.correct_answer}`
    ];
    
    const randomHint = hintOptions[Math.floor(Math.random() * hintOptions.length)];
    setHintText(randomHint);
  };

  const seeCorrectAnswer = () => {
    if (stars < 20 || selectedAnswer !== null) return;
    
    // Cost 20 stars to see the correct answer
    setStars(prev => prev - 20);
    
    // Show the correct answer
    const currentQ = questions[currentQuestion];
    setSelectedAnswer(currentQ.correct_index);
    setShowAnswer(true);
    
    // This doesn't count as a correct answer and automatically moves to next question
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setHintUsed(false);
        setHintText('');
      } else {
        // End of sub-round
        handleSubRoundComplete(false);
      }
    }, 2000); // Longer delay to show the answer
  };

  const renderQuestion = () => {
    if (questions.length === 0 || !questions[currentQuestion]) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading questions...</Text>
        </View>
      );
    }

    const currentQ = questions[currentQuestion];
    const isAnswered = selectedAnswer !== null;
    const isCorrect = isAnswered && selectedAnswer === currentQ.correct_index;

    return (
      <Animated.View 
        style={[
          styles.questionContainer,
          { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.statsContainer}>
            <StatItem iconName="heart" value={`×${hearts}`} color={colors.secondary} />
            <StatItem iconName="star" value={stars} color={colors.gamification.gold} />
          </View>

          <ProgressBar current={currentQuestion + 1} total={questions.length} width={100} />
        </View>

        <View style={styles.questionContent}>
          <Text style={styles.categoryText}>{currentQ.category || 'General Knowledge'}</Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          
          {hintText ? (
            <View style={styles.hintContainer}>
              <Ionicons name="bulb" size={18} color="#FFD93D" />
              <Text style={styles.hintText}>{hintText}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === currentQ.correct_index;
            let optionStyle: any = styles.option;
            let optionTextStyle: any = styles.optionText;
            
            if (isAnswered) {
              if (isSelected && isCorrectOption) {
                optionStyle = [styles.option, styles.correctOption];
                optionTextStyle = [styles.optionText, styles.correctOptionText];
              } else if (isSelected) {
                optionStyle = [styles.option, styles.wrongOption];
                optionTextStyle = [styles.optionText, styles.wrongOptionText];
              } else if (isCorrectOption) {
                optionStyle = [styles.option, styles.correctOption];
                optionTextStyle = [styles.optionText, styles.correctOptionText];
              }
            }
            
            return (
              <TouchableOpacity
                key={index}
                style={[optionStyle, isAnswered && styles.optionAnswered]}
                onPress={() => handleAnswer(index)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <View style={styles.optionIndicator}>
                  {isAnswered && isCorrectOption && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <Ionicons name="close" size={20} color="#F44336" />
                  )}
                </View>
                <Text style={optionTextStyle}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <ActionButton
            label="Hint (10⭐)"
            iconName="help-circle"
            onPress={useHint}
            disabled={hintUsed || stars < 10 || selectedAnswer !== null}
            color={colors.accent}
            backgroundColor={colors.surface}
            style={styles.footerButton}
          />
          <ActionButton
            label="See Answer (20⭐)"
            iconName="eye"
            onPress={seeCorrectAnswer}
            disabled={stars < 20 || selectedAnswer !== null}
            color={colors.food.carrot}
            backgroundColor={colors.surface}
            style={styles.footerButton}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      {renderQuestion()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    marginLeft: 4,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  progressContainer: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    padding: 16,
  },
  questionContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  categoryText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  hintText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5D4037',
    flex: 1,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionAnswered: {
    opacity: 0.8,
  },
  correctOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  wrongOption: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
  },
  wrongOptionText: {
    color: '#C62828',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default GameScreen;