    import React, {useEffect, useState} from 'react';
    import lang from "./assets/Languages.js"
    import clsx from "clsx";
    import Confetti from 'react-confetti';
    import words from './assets/Words.js';
    import laughingCat from './assets/laughing-cat.gif';
    import { getFarewellText } from '../Util.js';
    export default function App() {

        function getRandomWord() {
            const randomIndex = Math.floor(Math.random() * words.length);
            return words[randomIndex];
        }

        const [hasScored, setHasScored] = useState(false);
        const [score, setScore] = useState(0);
        const [highScore, setHighScore] = useState(() => {
            const stored = localStorage.getItem("highScore");
            return stored ? parseInt(stored, 10) : 0;
        });
        const [showHint, setShowHint] = useState(false);
        const [guessedLetter, setGuessedLetter] = React.useState([]);

        const [currentWordObj, setCurrentWordObj] = React.useState(() => getRandomWord());
        const currentWord = currentWordObj.word;

        const[dimension, setDimension] = React.useState({width: window.innerWidth, height: window.innerHeight});

        //For Confetti
        useEffect(() => {
            function handleResize() {
                setDimension({width: window.innerWidth, height: window.innerHeight});
            }
            window.addEventListener("resize", handleResize);
            startNewGame();
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        const wrongGuessCount = guessedLetter.filter(letter => !currentWord.includes(letter)).length;
        const isGameWon = currentWord.split("").every(letter => guessedLetter.includes(letter));
        const isGameLost = wrongGuessCount >= lang.length - 1;
        const isGameOver = isGameWon || isGameLost;

        const lastGuessedLetter = guessedLetter[guessedLetter.length - 1];
        const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);
        const gameStatusClass = clsx("game-status", {
            won: isGameWon,
            lost: isGameLost,
            farewell: !isGameOver && isLastGuessIncorrect
        })


        //Set High-Score
        useEffect(() => {
            if (isGameWon && !hasScored) {
                setScore(prevScore => {
                    const newScore = prevScore + 1;

                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem("highScore", newScore);
                    }
                    return newScore;
                });
                setHasScored(true);
            }
        }, [isGameWon, hasScored, highScore]);

        function addGuessedLetter(letter) {

            if (isGameOver) return;

            setGuessedLetter(prevLetter =>
            prevLetter.includes(letter) ?
                prevLetter :
                [...prevLetter, letter]
            )
        }


        const languageElms = lang.map(((language,index) => {
            const isLanguageLost = index < wrongGuessCount;
            const styles = {
                backgroundColor: language.backgroundColor,
                color: language.color
            }
            const className = clsx("chip", isLanguageLost && " language-lost");
            return (
                <span
                    className= {className}
                    style={styles}
                    key={language.name}
                >{language.name}</span>
            )
        }))

        const letterElms = currentWord.split("").map((letter, index) => (
        <span key={index}>{guessedLetter.includes(letter)? letter.toUpperCase() : "_"}</span>));


        const alphabet = "abcdefghijklmnopqrstuvwxyz";

        const keyboardElements = alphabet.split("").map(letter => {
            const isGuessed = guessedLetter.includes(letter.toLowerCase());
            const isCorrect = isGuessed && currentWord.includes(letter.toLowerCase());
            const isWrong = isGuessed && !currentWord.includes(letter.toLowerCase());
            const className = clsx({
                correct: isCorrect,
                wrong: isWrong
            })
            return (
                <button
                    className={className}
                    onClick={() => addGuessedLetter(letter)}
                    key={letter}
                    aria-label={`Letter ${letter}`}>
                    {letter.toUpperCase()}
                </button>)
        })

        function startNewGame() {
            const newWordObj = getRandomWord();
            const word = newWordObj.word;
            const lettersToReveal = Array.from(new Set(word))
                .sort(() => 0.3 - Math.random())
                .slice(0, Math.min(2, word.length));
            setCurrentWordObj(newWordObj);
            setGuessedLetter(lettersToReveal);
            setShowHint(false);
            setHasScored(false);
        }



        function renderGameStatus() {
            if (!isGameOver && isLastGuessIncorrect) {
                return (
                    <p className='farewell-message'>{getFarewellText(lang[wrongGuessCount - 1].name)}</p>
                );
            }

            if (isGameWon) {
                return (
                    <>
                        <h2>You win!</h2>
                        <p>Well Done!🥳</p>
                    </>
                )
            }

            if (isGameLost) {
               return <>
                    <h2>Game Over</h2>
                    <p>Game Over! You better start learning Assembly😭</p>
                   <p>The correct word was: '{currentWordObj.word.toUpperCase()}'</p>
                   <img
                       src={laughingCat}
                       alt= 'laughingCat'
                       className='cat-fade-in'
                       style={{
                           width: "200px",
                           marginTop: '1rem',
                           borderRadius: '8px',
                       }}
                       />
                </>
            }
        }



        return (
            <>
                <main>
                    <header>
                        <h1>Assembly: Endgame</h1>
                        <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
                    </header>

                    <section className={gameStatusClass}>
                        {renderGameStatus()}
                    </section>

                    <section className='language-chips'>
                        {languageElms}
                    </section>

                    <section className='score'>
                        <p>Score: {score} </p>
                        <p>| High Score: {highScore}</p>
                    </section>

                    {!isGameOver &&  (
                        <p style={{ opacity: isGameOver ? 0.6 : 1 }}>Attempts left: {lang.length - 1 - wrongGuessCount}</p>
                    )}

                    <section className= 'hint-section'>
                        {!isGameOver && (
                            <div>
                                {!showHint ? (
                                <button onClick={() => setShowHint(true)} >Need a hint?</button>
                                    ) : (
                                  <p><strong>Hint: </strong> {currentWordObj.hint}</p>
                                    )}
                            </div>
                        )}
                    </section>

                    <section className='word'>
                        {letterElms}
                    </section>
                    <section className='keyboard'>
                        {keyboardElements}
                    </section>
                    <footer>
                        {isGameOver  && <button onClick={startNewGame}>Next Word?</button>}
                    </footer>

                    {isGameWon && (
                        <Confetti
                            width={dimension.width}
                            height={dimension.height}
                        />
                    )}
                </main>
            </>
        )
    }