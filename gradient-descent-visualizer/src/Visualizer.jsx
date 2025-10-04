import React, { useState, useRef, useEffect } from "react";
import Plot from "react-plotly.js";
import "./Visualizer.css";

function Visualizer() {
  const [functions, setFunctions] = useState([]);
  const [lossFn, setLossFn] = useState(null);
  const [learningRate, setLearningRate] = useState(0.05);
  const [marker, setMarker] = useState([0, 0, 0]);
  const [markerSize, setMarkerSize] = useState(10);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/functions")
      .then((res) => res.json())
      .then((data) => {
        setFunctions(data);
        setLossFn(data[0]);
      });
  }, []);

  const loss = (x, y) => {
    if (!lossFn) return 0;
    switch (lossFn.name) {
      case "paraboloid":
        return x * x + y * y;
      case "saddle":
        return x * x - y * y;
      case "rosenbrock":
        return (1 - x) ** 2 + 100 * (y - x * x) ** 2;
      default:
        return x * x + y * y;
    }
  };

  const gradient = (x, y) => {
    if (!lossFn) return [0, 0];
    switch (lossFn.name) {
      case "paraboloid":
        return [2 * x, 2 * y];
      case "saddle":
        return [2 * x, -2 * y];
      case "rosenbrock":
        return [
          -2 * (1 - x) - 400 * x * (y - x * x),
          200 * (y - x * x),
        ];
      default:
        return [2 * x, 2 * y];
    }
  };

  const generateSurface = () => {
    if (!lossFn) return { x: [], y: [], z: [] };
    const [min, max] = lossFn.range;
    const points = 80;
    const range = [...Array(points)].map(
      (_, i) => min + (i / (points - 1)) * (max - min)
    );
    const z = range.map((xi) => range.map((yi) => loss(xi, yi)));
    return { x: range, y: range, z };
  };

  const { x, y, z } = generateSurface();

  const handleClick = (event) => {
    if (event.points && event.points[0]) {
      const px = event.points[0].x;
      const py = event.points[0].y;
      setMarker([px, py, loss(px, py)]);
    }
  };

  const startAnimation = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setMarker(([x, y]) => {
        const [gx, gy] = gradient(x, y);
        const newX = x - learningRate * gx;
        const newY = y - learningRate * gy;
        return [newX, newY, loss(newX, newY)];
      });
    }, animationSpeed);
  };

  const pauseAnimation = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const resetAnimation = () => {
    pauseAnimation();
    setMarker([0, 0, loss(0, 0)]);
  };

  return (
    <div className="app">
      <h1>Gradient Descent Visualizer</h1>

      <div className="control-panel">
        {functions.length > 0 && (
          <div className="control-group">
            <label>Loss Function</label>
            <select
              value={lossFn?.name}
              onChange={(e) =>
                setLossFn(functions.find((fn) => fn.name === e.target.value))
              }
            >
              {functions.map((fn) => (
                <option key={fn.name} value={fn.name}>
                  {fn.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="control-group">
          <label>Learning Rate</label>
          <input
            type="number"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Marker Size</label>
          <input
            type="number"
            value={markerSize}
            onChange={(e) => setMarkerSize(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Animation Speed (ms)</label>
          <input
            type="number"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(parseInt(e.target.value))}
          />
        </div>

        <div className="info-box">
          💡 Click anywhere on the graph to place the marker.
        </div>

        <div className="button-group">
          <button className="start" onClick={startAnimation}>Start</button>
          <button className="pause" onClick={pauseAnimation}>Pause</button>
          <button className="reset" onClick={resetAnimation}>Reset</button>
        </div>
      </div>

      <div className="plot-container">
        <Plot
          data={[
            {
              type: "surface",
              x,
              y,
              z,
              colorscale: "Viridis",
              opacity: 0.9,
            },
            {
              type: "scatter3d",
              mode: "markers",
              x: [marker[0]],
              y: [marker[1]],
              z: [marker[2]],
              marker: { size: markerSize, color: "red" },
            },
          ]}
          layout={{
            autosize: true,
            title: "Click anywhere on the surface to set start point",
            scene: {
              xaxis: { title: "X" },
              yaxis: { title: "Y" },
              zaxis: { title: "Loss" },
            },
          }}
          style={{ width: "100%", height: "800px" }}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default Visualizer;
