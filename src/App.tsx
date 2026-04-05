import { useGameLogic } from './hooks/useGameLogic';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { SummaryScreen } from './components/SummaryScreen';

function App() {
  const {
    phase,
    currentProblem,
    currentIndex,
    currentInput,
    feedback,
    results,
    timeLeft,
    startGame,
    resetGame,
    handleNumberPress,
    handleBackspace,
    handleSubmit,
  } = useGameLogic();

  if (phase === 'start') {
    return <StartScreen onStart={startGame} />;
  }

  if ((phase === 'playing' || phase === 'feedback') && currentProblem) {
    return (
      <GameScreen
        problem={currentProblem}
        currentIndex={currentIndex}
        currentInput={currentInput}
        feedback={feedback}
        timeLeft={timeLeft}
        results={results}
        onNumberPress={handleNumberPress}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === 'summary') {
    return <SummaryScreen results={results} onPlayAgain={resetGame} />;
  }

  return null;
}

export default App;
