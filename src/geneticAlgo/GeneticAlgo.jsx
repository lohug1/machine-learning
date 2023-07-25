import * as React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Grid, Button, Slider, Typography } from '@mui/material';
import './GeneticAlgo.css';

let size = 1000;
let mutationPr = 0.1;

let arr = [];
let arrFit = [];
for (let i = 0; i < size; i++) {
  let randomColor = Math.floor(Math.random() * 16777215).toString(16);
  while (randomColor.length < 6) randomColor = '0' + randomColor;
  arr.push('#' + randomColor);
  arrFit.push(999999999);
}

export default function GeneticAlgo() {
  const [goal, setGoal] = React.useState('#000000');
  const [generation, setGeneration] = React.useState([...arr]);
  const [mutationProb, setMutationProb] = React.useState(mutationPr);
  const [best, setBest] = React.useState(999999999);

  const handleMutChange = (event, newVal) => {
    setMutationProb(newVal);
  };
  let globalGeneration = generation;

  const fitnessCalc2 = () => {
    let fit = [];
    for (let i = 0; i < size; i++) {
      let rGoal = parseInt(Number('0x' + goal.slice(1, 3)), 10);
      let gGoal = parseInt(Number('0x' + goal.slice(3, 5)), 10);
      let bGoal = parseInt(Number('0x' + goal.slice(5, 7)), 10);
      let rGen = parseInt(Number('0x' + globalGeneration[i].slice(1, 3)), 10);
      let gGen = parseInt(Number('0x' + globalGeneration[i].slice(3, 5)), 10);
      let bGen = parseInt(Number('0x' + globalGeneration[i].slice(5, 7)), 10);

      fit.push(
        Math.abs(rGoal - rGen) + Math.abs(gGoal - gGen) + Math.abs(bGoal - bGen)
      );
    }
    var list = [];
    for (let j = 0; j < size; j++)
      list.push({ gen: globalGeneration[j], fit: fit[j] });

    list.sort(function (a, b) {
      return a.fit < b.fit ? -1 : a.fit == b.fit ? 0 : 1;
    });

    let genArr = [];

    for (let k = 0; k < list.length; k++) {
      genArr.push(list[k].gen);
    }
    globalGeneration = [...genArr];
    setGeneration([...globalGeneration]);
    setBest(list[0].fit);
  };

  const mutation = () => {
    let newGen = [];
    for (let i = 0; i < size; i++) {
      if (Math.random() < mutationProb) {
        let ranPos = Math.floor(Math.random() * 24);
        let mutRes =
          parseInt(Number('0x' + globalGeneration[i].slice(1, 7)), 10) ^
          (1 << ranPos);
        let strRes = Number(mutRes).toString(16);
        while (strRes.length < 6) strRes = '0' + strRes;
        newGen.push('#' + strRes);
      } else {
        newGen.push(globalGeneration[i]);
      }
    }
    globalGeneration = newGen;
    fitnessCalc2();
  };
  const crossover = () => {
    let newGen = [];
    for (let i = 0; i < size - 1; i += 2) {
      newGen.push(
        '#' +
          globalGeneration[i][1] +
          globalGeneration[i + 1][2] +
          globalGeneration[i][3] +
          globalGeneration[i + 1][4] +
          globalGeneration[i][5] +
          globalGeneration[i + 1][6]
      );
    }
    globalGeneration = [...globalGeneration.slice(0, 500).concat(newGen)];
    mutation();
  };

  const fitnessCalc = () => {
    let fit = [];
    for (let i = 0; i < size; i++) {
      let rGoal = parseInt(Number('0x' + goal.slice(1, 3)), 10);
      let gGoal = parseInt(Number('0x' + goal.slice(3, 5)), 10);
      let bGoal = parseInt(Number('0x' + goal.slice(5, 7)), 10);
      let rGen = parseInt(Number('0x' + globalGeneration[i].slice(1, 3)), 10);
      let gGen = parseInt(Number('0x' + globalGeneration[i].slice(3, 5)), 10);
      let bGen = parseInt(Number('0x' + globalGeneration[i].slice(5, 7)), 10);

      fit.push(
        Math.abs(rGoal - rGen) + Math.abs(gGoal - gGen) + Math.abs(bGoal - bGen)
      );
    }
    var list = [];
    for (let j = 0; j < size; j++)
      list.push({ gen: globalGeneration[j], fit: fit[j] });

    list.sort(function (a, b) {
      return a.fit < b.fit ? -1 : a.fit == b.fit ? 0 : 1;
    });

    let genArr = [];

    for (let k = 0; k < list.length; k++) {
      genArr.push(list[k].gen);
    }
    globalGeneration = [...genArr];
    crossover();
  };

  return (
    <div className="goal-container">
      <div style={{ width: '30%', margin: '0 auto' }}>
        <Grid
          container
          spacing={2}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid item>
            <div className="goal-selector">
              <HexColorPicker color={goal} onChange={setGoal} />
              {goal}
            </div>
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
          <div
            key={idx}
            style={{ backgroundColor: color }}
            className="gen-node"
          ></div>
        ))}
      </div>
    </div>
  );
}
