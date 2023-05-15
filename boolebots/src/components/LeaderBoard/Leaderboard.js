import { useState, useEffect } from "react";
import "./leaderboard.scss";
import { Tag } from '@chakra-ui/react'

function Leaderboard({ battleResults }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults(battleResults);
  }, [battleResults]);

  const calculateScore = (battles) => {
    let score = 0;
    for (let key in battles) {
      score += battles[key];
    }
    return score;
  };

  const sortedResults = [...results].sort(
    (a, b) => calculateScore(b.battles) - calculateScore(a.battles)
  );

  return (
    <div className="leaderboard">
      <div className="header">
        <div className="col">Ranking</div>
        <div className="col">Battles</div>
        <div className="col"></div>
      </div>
      {sortedResults.map((result, index) => {
        return (
          <div key={result.id} className="row">
            <div className="col-ranking">{result.name}</div>
            <div className="col-battles">
              {result.battles.loss !== 0 && (
                <Tag className="result loss">{result.battles.loss} - Loss</Tag>
              )}
              {result.battles.tie !== 0 && (
                <Tag className="result tie">{result.battles.tie} - Tie</Tag>
              )}
              {result.battles.win !== 0 && (
                <Tag className="result win">{result.battles.win} - Win</Tag>
              )}
            </div>
            <div className="col-positions" style={{ color: index === 0 && 'orange' }}>
              {index + 1}º
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Leaderboard;
