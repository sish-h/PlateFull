// src/screens/GameScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import GameFooter from '../components/GameFooter';
import GameHeader from '../components/GameHeader';
import OptionsList from '../components/OptionsList';
import QuestionCard from '../components/QuestionCard';
import { useAnimations } from '../hooks/useAnimations';
import { useGameFlow } from '../hooks/useGameFlow';
import { useTTS } from '../hooks/useTTS';
import { RootStackParamList } from '../types/navigation';

type GameScreenProps = NativeStackScreenProps<RootStackParamList, 'Game'>;

const GameScreen = ({ navigation, route }: GameScreenProps) => {
  const { difficulty, questions: subRoundQuestions } = route.params;
  
  // Custom hooks for different concerns
  const { 
    speakText, 
    stopSpeaking, 
    toggleTTS, 
    isSpeaking, 
    currentSpeakingText, 
    ttsEnabled 
  } = useTTS();
  
  const {
    currentQuestion,
    questions,
    hearts,
    stars,
    correctAnswers,
    hintsUsedCount,
    hintUsed,
    hintText,
    selectedAnswer,
    isAnswered,
    answerQuestion,
    useHint,
    seeCorrectAnswer,
    handleSubRoundComplete,
    getCurrentQuestion,
    getProgress,
    canUseHint,
    canSeeAnswer,
  } = useGameFlow({ difficulty, subRoundQuestions });
  
  const { fadeAnim, shakeAnim, animateFeedback, shake, resetAnimations } = useAnimations();

  // Auto-read question when it changes
  useEffect(() => {
    if (ttsEnabled && questions.length > 0 && questions[currentQuestion]) {
      const currentQ = questions[currentQuestion];
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        speakText(currentQ.question, true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, questions, ttsEnabled, speakText]);

  // Handle answer selection with animations
  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    const currentQ = questions[currentQuestion];
    const isCorrect = answerIndex === currentQ.correct_index;
    
    // Trigger animations
    if (isCorrect) {
      animateFeedback(true);
    } else {
      shake();
    }
    
    // Handle the answer
    answerQuestion(answerIndex);
  };

  // Handle hint usage
  const handleUseHint = () => {
    const hint = useHint();
    if (hint && ttsEnabled) {
      speakText(`Hint: ${hint}`);
    }
  };

  // Handle seeing correct answer
  const handleSeeCorrectAnswer = () => {
    const currentQ = questions[currentQuestion];
    seeCorrectAnswer();
    if (ttsEnabled) {
      speakText(`The correct answer is: ${currentQ.correct_answer}`);
    }
  };

  // Handle option press (read option aloud)
  const handleOptionPress = (optionText: string, index: number) => {
    if (ttsEnabled) {
      speakText(`Option ${String.fromCharCode(65 + index)}: ${optionText}`);
    }
  };

  // Handle question press (re-read question)
  const handleQuestionPress = () => {
    const currentQ = questions[currentQuestion];
    if (currentQ && ttsEnabled) {
      speakText(currentQ.question, true);
    }
  };

  // Handle reading question
  const handleReadQuestion = () => {
    const currentQ = questions[currentQuestion];
    if (currentQ && ttsEnabled) {
      speakText(currentQ.question, true);
    }
  };

  // Handle reading option
  const handleReadOption = (optionText: string, index: number) => {
    if (ttsEnabled) {
      speakText(`Option ${String.fromCharCode(65 + index)}: ${optionText}`);
    }
  };

  // Check if game is complete and handle navigation
  useEffect(() => {
    if (questions.length > 0 && currentQuestion >= questions.length) {
      // Game is complete, calculate results
      const results = handleSubRoundComplete(false);
      if (results) {
        navigation.navigate('Results', {
          score: results.score,
          totalQuestions: results.totalQuestions,
          starsEarned: results.starsEarned,
          isSubRoundComplete: results.passed,
          isRoundComplete: false,
          isLevelComplete: false
        });
      }
    }
  }, [currentQuestion, questions.length, handleSubRoundComplete, navigation]);

  // Loading state
  if (questions.length === 0 || !questions[currentQuestion]) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContainer}>
          <Text>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = getCurrentQuestion();
  const progress = getProgress();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <GameHeader
        hearts={hearts}
        stars={stars}
        category={currentQ.category || 'General Knowledge'}
        progress={progress}
        ttsEnabled={ttsEnabled}
        isSpeaking={isSpeaking}
        onToggleTTS={toggleTTS}
      />
      
      <View style={styles.questionContainer}>
        <QuestionCard
          question={currentQ.question}
          category={currentQ.category || 'General Knowledge'}
          isSpeaking={isSpeaking}
          currentSpeakingText={currentSpeakingText}
          onQuestionPress={handleQuestionPress}
          onReadQuestion={handleReadQuestion}
        />
        
        <OptionsList
          options={currentQ.options}
          correctIndex={currentQ.correct_index}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          isSpeaking={isSpeaking}
          currentSpeakingText={currentSpeakingText}
          onAnswerSelect={handleAnswerSelect}
          onOptionPress={handleOptionPress}
          onReadOption={handleReadOption}
        />
      </View>
      
      <GameFooter
        hintText={hintText}
        canUseHint={canUseHint}
        canSeeAnswer={canSeeAnswer}
        onUseHint={handleUseHint}
        onSeeAnswer={handleSeeCorrectAnswer}
      />
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
  questionContainer: {
    flex: 1,
    padding: 16,
  },
});

export default GameScreen;