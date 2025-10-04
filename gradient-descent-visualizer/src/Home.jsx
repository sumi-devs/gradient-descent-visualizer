import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-container">
            <h1 className="home-title">Gradient Descent Visualizer</h1>
            <p className="home-description">
                Gradient descent is an optimization algorithm used in machine learning
                and deep learning to minimize a loss function by iteratively moving
                towards the function's minimum. It works by computing the gradient
                (slope) of the loss surface and updating parameters step by step in the
                opposite direction of the gradient.
            </p>
            <p className="home-description">
                This visualizer lets you explore how gradient descent works on different
                loss surfaces. You can click anywhere on the 3D graph to place a starting
                point, adjust parameters like learning rate, and watch how the algorithm
                converges or diverges based on your settings.
            </p>
            <Link to="/visualizer" className="home-button">
                Go to Visualizer
            </Link>
        </div>
    );
}

export default Home;
