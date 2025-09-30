import React, { useState, useRef } from "react";
import Plot from "react-plotly.js";
import "./App.css";

function App() {
  const [fnName, setFnName] = useState("paraboloid");
  const [learningRate, setLearningRate] = useState(0.1);
  const [iterations, setIterations] = useState(30);
  const [markerSize, setMarkerSize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(300);
  const [points, setPoints] = useState([]);
  const [animatedPoints, setAnimatedPoints] = useState([]);
  const [startPoint, setStartPoint] = useState([3, 3]);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);
  const animationIndex = useRef(0);

  const runGradientDescent = async () => {
    const res = await fetch("http://localhost:3001/gradient-descent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        function: fnName,
        learningRate,
        iterations,
        startPoint
      })
    });
    const data = await res.json();
    setPoints(data.points);
    setAnimatedPoints([]);
    animationIndex.current = 0;
  };

  const startAnimation = () => {
    if (!points || points.length === 0) return;
    if (isAnimating) return;
    setIsAnimating(true);
    intervalRef.current = setInterval(() => {
      setAnimatedPoints((prev) => {
        if (animationIndex.current >= points.length) {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          return prev;
        }
        const nextPoint = points[animationIndex.current];
        animationIndex.current += 1;
        return [...prev, nextPoint];
      });
    }, animationSpeed);
  };

  const pauseAnimation = () => {
    clearInterval(intervalRef.current);
    setIsAnimating(false);
  };

  const resetAnimation = () => {
    pauseAnimation();
    setAnimatedPoints([]);
    animationIndex.current = 0;
  };

  const generateSurface = () => {
    const x = Array.from({ length: 50 }, (_, i) => i / 5 - 5);
    const y = Array.from({ length: 50 }, (_, i) => i / 5 - 5);
    const z = x.map((xi) =>
      y.map((yi) => {
        switch (fnName) {
          case "paraboloid": return xi * xi + yi * yi;
          case "saddle": return xi * xi - yi * yi;
          case "rosenbrock": return (1 - xi) ** 2 + 100 * (yi - xi * xi) ** 2;
          default: return xi * xi + yi * yi;
        }
      })
    );
    return { x, y, z };
  };

  const surface = generateSurface();
  const safePoints = animatedPoints.filter((p) => p);

  const startZ = (() => {
    const [x, y] = startPoint;
    switch (fnName) {
      case "paraboloid": return x * x + y * y;
      case "saddle": return x * x - y * y;
      case "rosenbrock": return (1 - x) ** 2 + 100 * (y - x * x) ** 2;
      default: return x * x + y * y;
    }
  })();

  const handleClick = (event) => {
    const xClicked = event.points[0].x;
    const yClicked = event.points[0].y;
    setStartPoint([xClicked, yClicked]);
    resetAnimation();
  };

  return (
    <div className="container">
      <h1>Gradient Descent Visualizer</h1>

      <div className="controls">
        <div className="control-group">
          <label>Loss Function:</label>
          <select value={fnName} onChange={(e) => setFnName(e.target.value)}>
            <option value="paraboloid">Paraboloid</option>
            <option value="saddle">Saddle</option>
            <option value="rosenbrock">Rosenbrock</option>
          </select>
        </div>
        <div className="control-group">
          <label>Learning Rate:</label>
          <input type="number" step="0.01" value={learningRate} onChange={(e) => setLearningRate(parseFloat(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Iterations:</label>
          <input type="number" value={iterations} onChange={(e) => setIterations(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Marker Size:</label>
          <input type="number" value={markerSize} onChange={(e) => setMarkerSize(parseInt(e.target.value))} />
        </div>
        <div className="control-group">
          <label>Animation Speed (ms):</label>
          <input type="number" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseInt(e.target.value))} />
        </div>
        <div className="button-group">
          <button onClick={runGradientDescent}>Compute Path</button>
          <button onClick={startAnimation}>Start</button>
          <button onClick={pauseAnimation}>Pause</button>
          <button onClick={resetAnimation}>Reset</button>
        </div>
      </div>

      <Plot
        data={[
          { type: "surface", x: surface.x, y: surface.y, z: surface.z, colorscale: "Viridis", opacity: 0.8 },
          { type: "scatter3d", mode: "markers+lines", x: safePoints.map(p => p[0]), y: safePoints.map(p => p[1]),
            z: safePoints.map(p => {
              switch (fnName) {
                case "paraboloid": return p[0] * p[0] + p[1] * p[1];
                case "saddle": return p[0] * p[0] - p[1] * p[1];
                case "rosenbrock": return (1 - p[0]) ** 2 + 100 * (p[1] - p[0] * p[0]) ** 2;
                default: return p[0] * p[0] + p[1] * p[1];
              }
            }),
            marker: { size: markerSize, color: "red" }
          },
          { type: "scatter3d", mode: "markers", x: [startPoint[0]], y: [startPoint[1]], z: [startZ], marker: { size: markerSize, color: "blue" } }
        ]}
        layout={{ width: 800, height: 700, title: "Gradient Descent", autosize: true }}
        onClick={handleClick}
      />
    </div>
  );
}

export default App;
