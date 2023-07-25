import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Grid, Button, Slider, Typography, Tooltip } from '@mui/material';
import Graph from 'react-graph-vis';
import './Tree.css';
import { v4 as uuidv4 } from 'uuid';

let size = 1000;
let mutationPr = 0.1;

let goal = 0;
let arr = [];

let arrGraphs = [];

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

let fullEdges = [];
let iter = 0;
for (let i = 0; i < graphTri.length; i++) {
  for (let j = 0; j < graphTri[i].length; j++) {
    if (graphTri[i][j] != 0)
      fullEdges.push({
        id: 'rndTreeEdge' + (i * iter + j),
        from: i,
        to: j + i,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        length: graphTri[i][j] * 10,
        label: '' + graphTri[i][j],
        physics: true,
        arrows: { to: { enabled: false } },
      });
    if (j === graphTri[i].length - 1) iter += j + 1;
  }
}

const fullGraph = {
  nodes: graph.map((val, idx) => {
    return { id: idx, label: '' + idx };
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
  height: '300px',
};

for (let i = 0; i < size; i++) {
  let auxGr = [];
  arr.push(
    graphTri.map((elem, idx) => {
      let ran = Math.floor(Math.random() * graphTri[idx].length);
      while (elem[ran] == 0) {
        ran = Math.floor(Math.random() * graphTri[idx].length);
      }
      auxGr.push(ran + idx);
      return elem[ran];
    })
  );
  arrGraphs.push(auxGr);
}

export default function Tree() {
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
      for (let j = 0; j < globalGraphGeneration[i].length; j++) {
        auxAdjMat[j][globalGraphGeneration[i][j]]++;
        auxAdjMat[globalGraphGeneration[i][j]][j]++;
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
            color: '#FFFFFF',
            length: graphTri[i][j] * 10,
            label: '' + graphTri[i][j],
            physics: true,
            arrows: { to: { enabled: false } },
            width: auxAdjMat[i][j + i] * 100,
          });
      }
    }
    network.setData({
      nodes: graph.map((val, idx) => {
        return { id: idx, label: '' + idx };
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
  const initGraph = (maxVertice) => {
    visited = new Array(maxVertice);
    stack = [];

    for (let i = 0; i < visited.length; i++) {
      visited[i] = false;
    }
    graphAdj = new Array(maxVertice);
    for (let i = 0; i < graphAdj.length; i++) {
      graphAdj[i] = new Array(maxVertice);
    }
    for (let i = 0; i < graphAdj.length; i++) {
      for (let j = 0; j < graphAdj[i].length; j++) {
        graphAdj[i][j] = 0;
      }
    }
  };

  const isTraversal = (node) => {
    stack.push(node);
    while (stack.length !== 0) {
      node = stack.pop();
      if (visited[node] === false) {
        visited[node] = true;
        for (let j = 0; j < graphAdj[node].length; j++) {
          if (graphAdj[node][j] === 1) {
            stack.push(j);
          }
        }
      }
    }
    let cnt = 0;
    for (let i = 0; i < visited.length; i++) {
      if (visited[i]) cnt++;
    }
    //console.log(cnt === graphAdj.length);
    return cnt === graphAdj.length;
  };
  const handleMutChange = (event, newVal) => {
    setMutationProb(newVal);
  };

  const fitnessCalc2 = () => {
    let fit = [];

    for (let i = 0; i < size; i++) {
      initGraph(graphTri.length + 1);
      for (let j = 0; j < globalGraphGeneration[i].length; j++) {
        //console.log(globalGraphGeneration[i][j]);
        graphAdj[j][globalGraphGeneration[i][j]] = 1;
        graphAdj[globalGraphGeneration[i][j]][j] = 1;
      }

      let sum = 0;
      if (!isTraversal(0)) sum += 999999;
      for (let j = 0; j < globalGeneration[i].length; j++) {
        sum += globalGeneration[i][j];
      }
      fit.push(sum);
    }
    var list = [];
    for (let j = 0; j < size; j++)
      list.push({
        gen: globalGeneration[j],
        fit: fit[j],
        gen2: globalGraphGeneration[j],
      });

    list.sort(function (a, b) {
      return a.fit < b.fit ? -1 : a.fit == b.fit ? 0 : 1;
    });

    let genArr = [];
    let genGraphArr = [];

    for (let k = 0; k < list.length; k++) {
      genArr.push(list[k].gen);
      genGraphArr.push(list[k].gen2);
    }
    globalGeneration = [...genArr];
    globalGraphGeneration = [...genGraphArr];

    setBest(list[0].fit);
    calcAvg();
  };

  const mutation = () => {
    let newGen = [];
    let newGraphGen = [];
    for (let i = 0; i < size; i++) {
      if (Math.random() < mutationProb) {
        let mutIdx = Math.floor(Math.random() * globalGeneration[i].length);
        let aux = [...globalGeneration[i]];
        let aux2 = [...globalGraphGeneration[i]];
        let ran = Math.floor(Math.random() * graph[mutIdx].length);
        while (graph[mutIdx][ran] === 0) {
          ran = Math.floor(Math.random() * graph[mutIdx].length);
        }
        aux[mutIdx] = graph[mutIdx][ran];
        aux2[mutIdx] = ran;
        newGen.push(aux);
        newGraphGen.push(aux2);
      } else {
        newGen.push(globalGeneration[i]);
        newGraphGen.push(globalGraphGeneration[i]);
      }
    }
    globalGeneration = newGen;
    globalGraphGeneration = newGraphGen;

    fitnessCalc2();
  };
  const crossover = () => {
    let newGen = [];
    let newGraphGen = [];
    for (let i = 0; i < size - 1; i += 2) {
      let len = globalGeneration[i].length;
      newGen.push(
        globalGeneration[i]
          .slice(0, Math.ceil(len / 2))
          .concat(globalGeneration[i].slice(Math.ceil(len / 2), len))
      );
      newGraphGen.push(
        globalGraphGeneration[i]
          .slice(0, Math.ceil(len / 2))
          .concat(globalGraphGeneration[i].slice(Math.ceil(len / 2), len))
      );
    }
    globalGeneration = [...globalGeneration.slice(0, 500).concat(newGen)];
    globalGraphGeneration = [
      ...globalGraphGeneration.slice(0, 500).concat(newGraphGen),
    ];

    mutation();
  };

  const fitnessCalc = () => {
    let fit = [];
    for (let i = 0; i < size; i++) {
      initGraph(graphTri.length + 1);
      for (let j = 0; j < globalGraphGeneration[i].length; j++) {
        graphAdj[j][globalGraphGeneration[i][j]] = 1;
        graphAdj[globalGraphGeneration[i][j]][j] = 1;
      }

      let sum = 0;

      if (!isTraversal(0)) sum += 999999;
      //if (i == 0) console.log(graphAdj);
      for (let j = 0; j < globalGeneration[i].length; j++) {
        sum += globalGeneration[i][j];
      }
      fit.push(sum);
    }
    var list = [];
    for (let j = 0; j < size; j++)
      list.push({
        gen: globalGeneration[j],
        fit: fit[j],
        gen2: globalGraphGeneration[j],
      });

    list.sort(function (a, b) {
      return a.fit < b.fit ? -1 : a.fit == b.fit ? 0 : 1;
    });

    let genArr = [];
    let genGraphArr = [];

    for (let k = 0; k < list.length; k++) {
      genArr.push(list[k].gen);
      genGraphArr.push(list[k].gen2);
    }
    globalGeneration = [...genArr];
    globalGraphGeneration = [...genGraphArr];
    crossover();
  };

  return (
    <div className="goal-container">
      <div style={{ width: '50%', margin: '0 auto' }}>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item style={{ backgroundColor: '#000000' }}>
            <Graph
              graph={fullGraphViz}
              options={options}
              style={{ width: '300px' }}
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
                style={{ color: 'white' }}
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
                style={{ color: 'white' }}
                id="discrete-slider-always"
                gutterBottom
              >
                Goal: {goal}
              </Typography>
              <Typography
                style={{ color: 'white' }}
                id="discrete-slider-always"
                gutterBottom
              >
                Best Fit: {generation[0]}
              </Typography>
              <Typography
                style={{ color: 'white' }}
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
              {color[0] + color[1] + color[2] + color[3] + color[4]}
            </div>
            {isShown[idx] && (
              <div className="preview">
                <Graph
                  graph={{
                    nodes: graph.map((val, idx2) => {
                      return { id: idx2, label: '' + idx2 };
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
                        aux.color = '#FFFF00';
                        aux.width = 4;
                      } else {
                        aux.color = '#ffffff';
                        aux.width = 2;
                      }
                      return aux;
                    }),
                  }}
                  options={options}
                  style={{ width: '300px' }}
                ></Graph>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
