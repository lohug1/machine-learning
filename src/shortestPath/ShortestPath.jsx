import * as React from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Grid, Button, Slider, Typography, Tooltip } from "@mui/material";
import Graph from "react-graph-vis";
import "./ShortestPath.css";

let size = 1000;
let mutationPr = 0.1;

let goal = 0;
let arr = [];

let arrGraphs = [];
let arrWalks = [];
let a = 0;
let b = 4;

let graph = [
  [0, 2, 20, 4, 0, 7],
  [2, 0, 3, 0, 8, 0],
  [20, 3, 0, 0, 10, 0],
  [4, 0, 0, 0, 4, 11],
  [0, 8, 10, 4, 0, 6],
  [7, 0, 0, 11, 6, 0],
];
let graphTri = [
  [0, 2, 20, 4, 0, 7],
  [0, 3, 0, 8, 0],
  [0, 0, 10, 0],
  [0, 4, 11],
  [0, 6],
];
const randomWalker = (from, to) => {
  let currentWlk = from;
  let rndIns = Math.floor(Math.random() * (graph[currentWlk].length - 2));
  let walk = [from];
  for (let i = 0; i < rndIns; i++)
    walk.push(Math.floor(Math.random() * graph[currentWlk].length));
  walk.push(to);
  return walk;
};

for (let i = 0; i < size; i++) arrWalks.push(randomWalker(a, b));

let fullEdges = [];
let iter = 0;
for (let i = 0; i < graphTri.length; i++) {
  for (let j = 0; j < graphTri[i].length; j++) {
    //console.log("rndTreeEdge" + (iter + j))
    if (graphTri[i][j] != 0)
      fullEdges.push({
        id: "rndTreeEdge" + (i * iter + j),
        from: i,
        to: j + i,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        length: graphTri[i][j] * 10,
        label: "" + graphTri[i][j],
        physics: true,
        arrows: { to: { enabled: false } },
      });
    if (j === graphTri[i].length - 1) iter += j + 1;
  }
}

const fullGraph = {
  nodes: graph.map((val, idx) => {
    return { id: idx, label: "" + idx };
  }),
  edges: fullEdges,
};
const options = {
  layout: {
    //hierarchical: true,
  },
  edges: {
    //color: "#000000",
  },
  height: "300px",
};

for (let i = 0; i < size; i++) {
  let auxGr = [a];
  let mutIdx = 1 + Math.floor(Math.random() * (graph.length - 2));
  let length = 2 + Math.floor(Math.random() * (graph.length - 2));

  for (let j = 0; j < length; j++) {
    let rndAux;
    do {
      rndAux = Math.floor(Math.random() * graph.length);
    } while (rndAux === a || rndAux === b);
    auxGr.push(rndAux);
  }

  auxGr.push(b);
  arr.push(auxGr);

  arrGraphs.push(auxGr);
}

export default function ShortestPath() {
  //const [goal, setGoal] = React.useState("#000000");
  const [network, setNetwork] = React.useState();
  const [generation, setGeneration] = React.useState([...arr]);
  const [graphGeneration, setGraphGeneration] = React.useState([...arrGraphs]);
  const [isShown, setIsShown] = React.useState(arr.map(() => false));
  const [mutationProb, setMutationProb] = React.useState(mutationPr);
  const [best, setBest] = React.useState(999999999);
  const [fullGraphViz, setFullGraphViz] = React.useState({ ...fullGraph });
  const handleHover = (value, idx) => {
    let arr = [...isShown];
    arr[idx] = value;
    setIsShown([...arr]);
  };
  let globalGeneration = generation;
  let globalGraphGeneration = graphGeneration;

  let graphAdj;
  let visited;
  let stack;

  const calcAvg = () => {
    let auxAdjMat = [];
    for (let i = 0; i < graph.length; i++) {
      auxAdjMat.push([]);
      for (let j = 0; j < graph.length; j++) auxAdjMat[i].push(0);
    }

    for (let i = 0; i < globalGraphGeneration.length; i++) {
      for (let j = 0; j < globalGraphGeneration[i].length - 1; j++) {
        if (
          graph[globalGraphGeneration[i][j]][
            globalGraphGeneration[i][j + 1]
          ] !== 0
        ) {
          auxAdjMat[j][globalGraphGeneration[i][j]]++;
          auxAdjMat[globalGraphGeneration[i][j]][j]++;
        }
      }
    }

    let sum = 0;
    for (let i = 0; i < auxAdjMat.length; i++)
      for (let j = 0; j < auxAdjMat[i].length; j++) sum += auxAdjMat[i][j];
    for (let i = 0; i < auxAdjMat.length; i++)
      for (let j = 0; j < auxAdjMat[i].length; j++)
        auxAdjMat[i][j] = auxAdjMat[i][j] / sum;

    let fEdges = [];
    for (let i = 0; i < graphTri.length; i++) {
      for (let j = 0; j < graphTri[i].length; j++) {
        if (graphTri[i][j] != 0)
          fEdges.push({
            from: i,
            to: j + i,
            color: "#FFFFFF",
            length: graphTri[i][j] * 10,
            label: "" + graphTri[i][j],
            physics: true,
            arrows: { to: { enabled: false } },
            width: auxAdjMat[i][j + i] * 100,
          });
      }
    }
    network.setData({
      nodes: graph.map((val, idx) => {
        return { id: idx, label: "" + idx };
      }),
      edges: fEdges,
    });
    /*
    for (let i = 0; i < fEdges.length; i++) {
      network.setOptions({
        edges: { id: "rndTreeEdge" + i, width: fEdges[i].width },
      });
    }*/
    //setFullGraphViz({ nodes: fullGraph.nodes, edges: fEdges });
    setGeneration([...globalGeneration]);
    setGraphGeneration([...globalGraphGeneration]);
  };

  const handleMutChange = (event, newVal) => {
    setMutationProb(newVal);
  };
  const fitnessAlg = () => {
    let fit = [];

    for (let i = 0; i < size; i++) {
      let sum = 0;
      //console.log(globalGeneration[i]);
      for (let j = 0; j < globalGeneration[i].length - 1; j++) {
        if (graph[globalGeneration[i][j]][globalGeneration[i][j + 1]] === 0)
          sum += 99999;
        else sum += graph[globalGeneration[i][j]][globalGeneration[i][j + 1]];
      }
      fit.push(sum);
    }
    var list = [];
    for (let j = 0; j < size; j++)
      list.push({
        gen: globalGeneration[j],
        fit: fit[j],
      });

    list.sort(function (a, b) {
      return a.fit < b.fit ? -1 : a.fit == b.fit ? 0 : 1;
    });

    let genArr = [];

    for (let k = 0; k < list.length; k++) {
      genArr.push(list[k].gen);
    }
    globalGeneration = [...genArr];
    return list;
  };
  const fitnessCalc2 = () => {
    let list = fitnessAlg();
    setBest(list[0].fit);
    calcAvg();
  };

  const mutation = () => {
    let newGen = [];
    //globalGeneration.forEach((elem) => console.log(elem[elem.length - 1]));

    let counterGen = graph.map(() => 0);
    for (let i = 0; i < size; i++) {
      newGen.push([...globalGeneration[i]]);
      let auxTest = [...globalGeneration[i]];
      if (newGen[i][0] !== 0 || newGen[i][newGen[i].length - 1] !== 4)
        console.log("Init:", newGen[i]);
      if (Math.random() < mutationProb) {
        if (newGen[i].length > 2) {
          if (Math.random() < 0.5) {
            let mutIdx = 1 + Math.floor(Math.random() * (newGen[i].length - 3));
            counterGen[mutIdx]++;
            newGen[i].splice(mutIdx, 1);
          } else {
            let mutIdx = 1 + Math.floor(Math.random() * (newGen[i].length - 3));
            counterGen[mutIdx]++;
            let rndAux;
            do {
              rndAux = Math.floor(Math.random() * graph.length);
            } while (rndAux === a || rndAux === b);
            newGen[i][mutIdx] = rndAux;
          }
        }
      }
      if (newGen[i][0] !== 0 || newGen[i][newGen[i].length - 1] !== 4)
        console.log("Gen:", auxTest, "End:", newGen[i]);
    }

    globalGeneration = newGen;

    //globalGeneration.forEach((elem) => console.log(elem[elem.length - 1]));
    fitnessCalc2();
  };
  const crossover = () => {
    let newGen = [];

    for (let i = 0; i < size - 1; i += 2) {
      let len = globalGeneration[i].length;
      let len2 = globalGeneration[i + 1].length;
      newGen.push(
        globalGeneration[i]
          .slice(0, Math.ceil(len / 2))
          .concat(globalGeneration[i + 1].slice(Math.ceil(len2 / 2), len2))
      );
    }
    globalGeneration = [...globalGeneration.slice(0, 500).concat(newGen)];

    mutation();
  };

  const fitnessCalc = () => {
    fitnessAlg();
    crossover();
  };

  return (
    <div className="goal-container">
      <div style={{ width: "50%", margin: "0 auto" }}>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item style={{ backgroundColor: "#000000" }}>
            <Graph
              graph={fullGraphViz}
              options={options}
              style={{ width: "300px" }}
              getNetwork={(network) => {
                setNetwork(network);
              }}
            />
          </Grid>
          <Grid item>
            <div
              style={{ backgroundColor: goal }}
              className="goal-preview"
            ></div>
          </Grid>
          <Grid item xs>
            <div>
              <Typography
                style={{ color: "white" }}
                id="discrete-slider-always"
                gutterBottom
              >
                Mutation Probability
              </Typography>
              <Slider
                value={mutationProb}
                valueLabelDisplay="on"
                step={0.01}
                min={0}
                max={1}
                onChange={handleMutChange}
              ></Slider>
              <Button onClick={fitnessCalc} variant="contained">
                START
              </Button>
              <Typography
                style={{ color: "white" }}
                id="discrete-slider-always"
                gutterBottom
              >
                Goal: {goal}
              </Typography>
              <Typography
                style={{ color: "white" }}
                id="discrete-slider-always"
                gutterBottom
              >
                Best Fit: {generation[0].map((elem) => `${elem} `)}
              </Typography>
              <Typography
                style={{ color: "white" }}
                id="discrete-slider-always"
                gutterBottom
              >
                Fitness: {best}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </div>
      <div className="gen-table">
        {generation.map((color, idx) => (
          <div key={idx} className="nodeParent">
            <div
              style={{ backgroundColor: color }}
              className="gen-node"
              onMouseOver={() => handleHover(true, idx)}
              onMouseOut={() => handleHover(false, idx)}
            >
              {color.reduce((a, b) => a + b)}
            </div>
            {isShown[idx] && (
              <div className="preview">
                <Graph
                  graph={{
                    nodes: graph.map((val, idx2) => {
                      return { id: idx2, label: "" + idx2 };
                    }),
                    edges: fullEdges.map((elem, idx2) => {
                      let aux = { ...elem };
                      let match = false;
                      for (let i = 0; i < graphGeneration[idx].length; i++) {
                        if (
                          (i === elem.from &&
                            graphGeneration[idx][i] === elem.to) ||
                          (graphGeneration[idx][i] === elem.from &&
                            i === elem.to)
                        ) {
                          match = true;
                          break;
                        }
                      }
                      if (match) {
                        aux.color = "#FFFF00";
                        aux.width = 4;
                      } else {
                        aux.color = "#ffffff";
                        aux.width = 2;
                      }
                      return aux;
                    }),
                  }}
                  options={options}
                  style={{ width: "300px" }}
                ></Graph>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
