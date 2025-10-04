import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Visualizer from './Visualizer.jsx';
import Home from './Home.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/visualizer" element={<Visualizer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;