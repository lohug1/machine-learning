import * as React from 'react';
import './style.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import GeneticAlgo from './geneticAlgo/GeneticAlgo';
import Tree from './tree/Tree';
import ShortestPath from './shortestPath/ShortestPath';

export default function App() {
  return (
    <div>
      <div className="App-bg"></div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<GeneticAlgo></GeneticAlgo>} />
          <Route exact path="/spanning" element={<Tree></Tree>} />
          <Route
            exact
            path="/shortest"
            element={<ShortestPath></ShortestPath>}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
