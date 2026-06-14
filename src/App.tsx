import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainMenu } from '@/components/MainMenu/MainMenu';
import { LevelSelect } from '@/components/LevelSelect/LevelSelect';
import { GameScreen } from '@/components/GameScreen/GameScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/challenge" element={<LevelSelect />} />
        <Route path="/challenge/:levelId" element={<GameScreen />} />
        <Route path="/free" element={<GameScreen isFreeMode />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
