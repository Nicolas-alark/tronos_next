import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function GameScreen() {
  const [rockets, setRockets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const { user } = useAuth();
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadRockets();
  }, []);

  const loadRockets = async () => {
    const result = await spacexApi.getRockets();
    if (result.success) {
      setRockets(result.data);
      generateQuestions(result.data);
    }
    setLoading(false);
  };

  const generateQuestions = (rocketsData) => {
    const questionTypes = [
      {
        type: 'height',
        question: (rocket) => `¿Cuál es la altura del cohete ${rocket.name}?`,
        getAnswer: (rocket) => `${rocket.height.meters} metros`,
        getValue: (rocket) => rocket.height.meters,
      },
      {
        type: 'engines',
        question: (rocket) => `¿Cuántos motores tiene el ${rocket.name}?`,
        getAnswer: (rocket) => `${rocket.engines.number} motores`,
        getValue: (rocket) => rocket.engines.number,
      },
      {
        type: 'country',
        question: (rocket) => `¿De qué país es el cohete ${rocket.name}?`,
        getAnswer: (rocket) => rocket.country,
        getValue: (rocket) => rocket.country,
      },
      {
        type: 'cost',
        question: (rocket) => `¿Cuál es el costo aproximado de lanzamiento del ${rocket.name}?`,
        getAnswer: (rocket) => `$${(rocket.cost_per_launch / 1000000).toFixed(0)} millones`,
        getValue: (rocket) => rocket.cost_per_launch,
      },
      {
        type: 'success',
        question: (rocket) => `¿Cuál es la tasa de éxito del ${rocket.name}?`,
        getAnswer: (rocket) => `${rocket.success_rate_pct}%`,
        getValue: (rocket) => rocket.success_rate_pct,
      },
    ];

    const newQuestions = [];
    const usedRockets = new Set();

    while (newQuestions.length < 10 && usedRockets.size < rocketsData.length) {
      const rocket = rocketsData[Math.floor(Math.random() * rocketsData.length)];
      
      if (!usedRockets.has(rocket.id)) {
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        // Generar opciones incorrectas
        const correctAnswer = questionType.getAnswer(rocket);
        const options = [correctAnswer];
        
        // Crear 3 opciones incorrectas
        while (options.length < 4) {
          const randomRocket = rocketsData[Math.floor(Math.random() * rocketsData.length)];
          const wrongAnswer = questionType.getAnswer(randomRocket);
          
          if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
          }
        }
        
        // Mezclar opciones
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        
        newQuestions.push({
          question: questionType.question(rocket),
          options: shuffledOptions,
          correctAnswer: correctAnswer,
          rocket: rocket.name,
        });
        
        usedRockets.add(rocket.id);
      }
    }

    setQuestions(newQuestions);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestion(0);
    setScore(0);
    setGameFinished(false);
    setShowResult(false);
    setSelectedAnswer(null);
    generateQuestions(rockets);
  };

  const handleAnswer = (answer) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 10);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setGameFinished(true);
    
    // Guardar puntuación en Firebase
    try {
      await addDoc(collection(db, 'scores'), {
        userId: user.uid,
        userEmail: user.email,
        score: score + 10, // +10 por la última respuesta correcta
        date: new Date().toISOString(),
        totalQuestions: questions.length,
      });
    } catch (error) {
      console.error('Error al guardar puntuación:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005288" />
        <Text style={styles.loadingText}>Preparando el juego...</Text>
      </View>
    );
  }

  if (!gameStarted) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="game-controller" size={100} color="#005288" />
          <Text style={styles.welcomeTitle}>Rocket Quiz</Text>
          <Text style={styles.welcomeSubtitle}>
            Pon a prueba tus conocimientos sobre los cohetes de SpaceX
          </Text>

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Cómo jugar:</Text>
            <View style={styles.ruleItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.ruleText}>10 preguntas sobre cohetes SpaceX</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.ruleText}>10 puntos por respuesta correcta</Text>
            </View>
            <View style={styles.ruleItem}>
              <Ionicons name="time" size={24} color="#FF6B35" />
              <Text style={styles.ruleText}>Sin límite de tiempo</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Comenzar Juego</Text>
            <Ionicons name="play" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (gameFinished) {
    const finalScore = score;
    const percentage = (finalScore / (questions.length * 10)) * 100;
    
    return (
      <View style={styles.resultContainer}>
        <Ionicons name="trophy" size={100} color="#FFD700" />
        <Text style={styles.resultTitle}>¡Juego Terminado!</Text>
        
        <Animated.View style={[styles.scoreBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.finalScore}>{finalScore}</Text>
          <Text style={styles.scoreLabel}>puntos</Text>
        </Animated.View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{questions.length}</Text>
            <Text style={styles.statLabel}>Preguntas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(percentage)}%</Text>
            <Text style={styles.statLabel}>Precisión</Text>
          </View>
        </View>

        <Text style={styles.resultMessage}>
          {percentage >= 80 ? '¡Excelente! Eres un experto en cohetes 🚀' :
           percentage >= 60 ? '¡Buen trabajo! Conoces bien los cohetes 👍' :
           percentage >= 40 ? 'No está mal, pero puedes mejorar 📚' :
           '¡Sigue aprendiendo sobre cohetes! 💪'}
        </Text>

        <TouchableOpacity style={styles.playAgainButton} onPress={startGame}>
          <Ionicons name="refresh" size={24} color="#fff" />
          <Text style={styles.playAgainText}>Jugar de Nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.questionNumber}>
            Pregunta {currentQuestion + 1} de {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={styles.scoreText}>Puntos: {score}</Text>
        </Animated.View>
      </View>

      <ScrollView style={styles.questionContainer}>
        <View style={styles.rocketBadge}>
          <Ionicons name="rocket" size={40} color="#005288" />
          <Text style={styles.rocketName}>{currentQ.rocket}</Text>
        </View>

        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.correctOption,
                  showWrong && styles.wrongOption,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={showResult}
              >
                <Text style={[
                  styles.optionText,
                  (showCorrect || showWrong) && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
                {showCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                )}
                {showWrong && (
                  <Ionicons name="close-circle" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {showResult && (
          <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentQuestion + 1 < questions.length ? 'Siguiente Pregunta' : 'Ver Resultados'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005288',
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  rulesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 40,
    width: '100%',
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ruleText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005288',
    borderRadius: 12,
    padding: 18,
    marginTop: 30,
    width: '100%',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
  },
  progressContainer: {
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#005288',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#005288',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  rocketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  rocketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005288',
    marginLeft: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  correctOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  wrongOption: {
    backgroundColor: '#FF5722',
    borderColor: '#FF5722',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#005288',
    borderRadius: 12,
    padding: 18,
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
  },
  scoreBox: {
    backgroundColor: '#005288',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
    minWidth: 200,
  },
  finalScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#005288',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  resultMessage: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  playAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#005288',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    justifyContent: 'center',
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});