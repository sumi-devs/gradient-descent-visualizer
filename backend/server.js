const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

function getGradient(fnName, x, y) {
  switch (fnName) {
    case "paraboloid":
      return [2 * x, 2 * y];
    case "saddle":
      return [2 * x, -2 * y];
    case "rosenbrock":
      let gradX = -400 * x * (y - x * x) - 2 * (1 - x);
      let gradY = 200 * (y - x * x);
      return [gradX, gradY];
    default:
      return [2 * x, 2 * y];
  }
}

app.post("/gradient-descent", (req, res) => {
  const { function: fnName, learningRate, iterations, startPoint } = req.body;
  let [x, y] = startPoint;
  const points = [[x, y]];

  for (let i = 0; i < iterations; i++) {
    const [gradX, gradY] = getGradient(fnName, x, y);
    x -= learningRate * gradX;
    y -= learningRate * gradY;
    points.push([x, y]);
  }

  res.json({ points, converged: true });
});

app.listen(3001, () => console.log("Server running on port 3001"));
