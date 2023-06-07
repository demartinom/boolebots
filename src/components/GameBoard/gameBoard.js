import React, { useState, useContext } from "react";
import { BotDataContext, AppContext } from "../../App.js";
import { Button, ButtonGroup, Tooltip } from "@chakra-ui/react";
import "./gameboard.scss";
import {
  FaEye,
  FaEyeSlash,
  FaUsersCog,
  FaUsersSlash,
  FaPlay,
  FaPause,
} from "react-icons/fa";

import useInterval from "../../useInterval";

const GameBoard = ({ boardSize }) => {
  const {
    bot1Data,
    setBot1Data,
    bot2Data,
    setBot2Data,
    bot3Data,
    setBot3Data,
    bot4Data,
    setBot4Data,
    speed,
    // wins,
    setWins,
    operation,
  } = useContext(BotDataContext);

  const { showLeaderboard, setShowLeaderboard, showPanel, setShowPanel } =
    useContext(AppContext);

  //State for whether the game should play out or not
  const [gameStatus, setGameStatus] = useState(false);

  //This version allows for each square to have an id with it's coordinates. This will help when triggering a bot battle.
  const board = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      board.push(`${col + 1},${row + 1}`);
    }
  }

  const gameBoard = board.map((tile) => (
    <div className="tile" id={tile} key={tile}>
      {(() => {
        switch (tile) {
          case `${bot1Data.x.toString()},${bot1Data.y.toString()}`:
            return (
              <Tooltip placement="auto" bg="orange" fontSize='xs' label={bot1Data.name} isOpen>
                <img src={bot1Data.icon} alt="bot 1" className="bot-icon" />
              </Tooltip>
            );
          case `${bot2Data.x.toString()},${bot2Data.y.toString()}`:
            return (
              <Tooltip placement="auto" bg="green.500" fontSize='xs' label={bot2Data.name} isOpen>
                <img src={bot2Data.icon} alt="bot 2" className="bot-icon" />
              </Tooltip>
            );
          case `${bot3Data.x.toString()},${bot3Data.y.toString()}`:
            return (
              <Tooltip placement="auto" bg="cyan.600" fontSize='xs' label={bot3Data.name} isOpen>
                <img src={bot3Data.icon} alt="bot 3" className="bot-icon" />
              </Tooltip>
            );
          case `${bot4Data.x.toString()},${bot4Data.y.toString()}`:
            return (
              <Tooltip placement="auto" bg="purple" fontSize='xs' label={bot4Data.name} isOpen>
                <img src={bot4Data.icon} alt="bot 4" className="bot-icon" />
              </Tooltip>
            );
          default:
            return null;
        }
      })()}
    </div>
  ));

  // handles random bot movement
  const [isFirst, setIsFirst] = useState(true);
  useInterval(() => {
    if (gameStatus) {
      setBot1Data(moveBots(bot1Data));
      setBot2Data(moveBots(bot2Data));
      setBot3Data(moveBots(bot3Data));
      setBot4Data(moveBots(bot4Data));
      battle();
      function moveBots(botData) {
        const directions = ["north", "south", "west", "east"];
        let direction;
        if (isFirst) {
          direction = botData.direction;
          setIsFirst(false);
        } else {
          direction = directions[Math.floor(Math.random() * directions.length)];
        }
        // this makes sure  the new coordinates are based on the random direction
        let newX = botData.x;
        let newY = botData.y;

        switch (direction) {
          case "north":
            newY = Math.max(botData.y - 1, 1); // Ensure the new coordinate is within the board boundaries
            break;
          case "south":
            newY = Math.min(botData.y + 1, boardSize); // Ensure the new coordinate is within the board boundaries
            break;
          case "west":
            newX = Math.max(botData.x - 1, 1); // Ensure the new coordinate is within the board boundaries
            break;
          case "east":
            newX = Math.min(botData.x + 1, boardSize); // Ensure the new coordinate is within the board boundaries
            break;
          default:
            break;
        }
        return { ...botData, x: newX, y: newY };
      }
    }
  }, speed);
  const botsData = [bot1Data, bot2Data, bot3Data, bot4Data];
  let hasMatchingBots = false;

  const battle = () => {
    let bot1;
    let bot2;
    for (let i = 0; i < botsData.length - 1; i++) {
      bot1 = botsData[i];

      for (let j = i + 1; j < botsData.length; j++) {
        bot2 = botsData[j];

        if (bot1.x === bot2.x && bot1.y === bot2.y) {
          hasMatchingBots = true;
          break;
        }
      }

      if (hasMatchingBots) {
        //console.log(bot1,bot2);
        calculateOutcome(bot1, bot2, operation);
        // battle function
        break;
      }
    }
  };

  //In this scenario, when there is a win from the operator,
  //we choose randomly what bot is the actual winner

  //randomly assign winner from the 2 colliding bots
  const chooseRandomBot = (botA, botB) => {
    const randomIndex = Math.floor(Math.random() * 2);
    return randomIndex === 0 ? botA : botB;
  };

  //check if there's a win or tie from operation, if win, assign winner with the random function
  function calculateOutcome(botA, botB, operator) {
    let result;
    let value1 = botA.boolean;
    let value2 = botB.boolean;
    console.log(value1, value2, operator);

    switch (operator) {
      case "AND":
        if (value1 === "1" && value2 === "1") {
          // if both are 1(high)
          const winner = chooseRandomBot(botA, botB);
          result = `winner: ${winner.name}`;
        } else {
          result = "Tie";
        }
        break;
      case "OR":
        if (value1 === "1" || value2 === "1") {
          // only a tie if both are 0(low)
          const winner = chooseRandomBot(botA, botB);
          result = `winner: ${winner.name}`;
        } else {
          result = "Tie";
        }
        break;
      case "XOR":
        if (
          (value1 === "1" && value2 === "0") ||
          (value1 === "0" && value2 === "1")
        ) {
          // if they are uneven
          const winner = chooseRandomBot(botA, botB);
          result = `winner: ${winner.name}`;
        } else {
          result = "Tie";
        }
        break;
      case "NOR":
        if (value1 === "0" && value2 === "0") {
          // if neither is 1(high)
          const winner = chooseRandomBot(botA, botB);
          result = `winner: ${winner.name}`;
        } else {
          result = "Tie";
        }
        break;
      default:
        return false; // not sure what the default should be
    }

    setWins((prevWins) => [...prevWins, result]);
  }

  return (
    <div className="board-container">
      <div
        className="game-board"
        style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
      >
        {gameBoard}
      </div>

      <ButtonGroup spacing={2} m={4}>
        <Button
          rightIcon={showPanel ? <FaUsersSlash /> : <FaUsersCog />}
          colorScheme="teal"
          variant="outline"
          size="lg"
          onClick={() => setShowPanel(!showPanel)}
        >
          Panel
        </Button>

        <Button
          rightIcon={gameStatus ? <FaPause />  : <FaPlay /> }
          colorScheme="teal"
          size="lg"
          variant="solid"
          onClick={() => {
            setGameStatus(!gameStatus);
          }}
        >
          {gameStatus ? "Pause" : "Battle"}
        </Button>

        <Button
          rightIcon={showLeaderboard ? <FaEyeSlash /> : <FaEye />}
          colorScheme="teal"
          variant="outline"
          size="lg"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          Ranking
        </Button>

      </ButtonGroup>
    </div>
  );
};

export default GameBoard;
