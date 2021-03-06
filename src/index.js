import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// functional component に変えるときの修正
// class -> function
// extends React.Component は書かない。
// render がなくなりそのまま return
// props を引数として取り this.props ではなく props でアクセスしている
// onClick のところ、()=>が無くなった
// onClick={props.onClick()} にすると、その場で実行されるのでダメ
class Square extends React.Component {
  render() {
  const style = this.props.needHighlight ? {backgroundColor: "#f0e000"} : {}

    return (
      <button style={style} className="square" onClick={this.props.onClick}>
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {
    const needHighlight = this.props.winnerLine.includes(i)
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        needHighlight={needHighlight}
      />
    );
  }

  render() {
    return (
      <div>
        {
          [0,1,2].map((i) =>
            <div className="board-row" key={i}>
              {
                [0,1,2].map((j) =>
                  this.renderSquare(i * 3 + j)
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        latest_hand: -1,
      }],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares)[0] || squares[i]) {
      return;
    }
    squares[i] =  this.state.xIsNext ? 'X' : 'O'
    this.setState({
      history: history.concat([{
        squares: squares,
        latest_hand: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  isCurrent(step) {
    return step === this.state.stepNumber;
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber];
    let winner;
    let winnerLine;
    [winner, winnerLine] = calculateWinner(current.squares);

    // ここで history だけ逆順にしても、index がそのままなのでダメ
    const moves = history.map((element, index) => {
      const low = Math.floor(element.latest_hand / 3) + 1;
      const column = element.latest_hand % 3 + 1;
      const desc = index ?
        `Go to move #${index} (${low}, ${column})` :
        "Go to game start";
      const style = this.isCurrent(index) ? { fontWeight: 'bold' } : {}
      return (
        <li>
          <button style={style} key={index} onClick={() => this.jumpTo(index)}>{desc}</button>
        </li>
      )

    })
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerLine={winnerLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{this.state.isAscending ? moves : moves.reverse()}</ol>
          <button onClick={() => this.setState({isAscending: !this.state.isAscending})}>Change the order</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  return ['', []];
}
