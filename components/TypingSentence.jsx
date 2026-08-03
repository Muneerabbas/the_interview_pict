"use client";

import { useEffect, useMemo, useState } from "react";

const WORDS = ["clear", "confident", "smart", "focused"];
const TYPE_SPEED_MS = 95;
const DELETE_SPEED_MS = 60;
const WORD_PAUSE_MS = 1000;

export default function TypingSentence() {
  const [wordIndex, setWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState("");
  const [phase, setPhase] = useState("typing");

  const currentWord = useMemo(() => WORDS[wordIndex], [wordIndex]);
  const longestWord = useMemo(
    () => WORDS.reduce((longest, word) => (word.length > longest.length ? word : longest), ""),
    []
  );

  useEffect(() => {
    let timeoutId;

    if (phase === "typing") {
      if (typedWord.length < currentWord.length) {
        timeoutId = setTimeout(() => {
          setTypedWord(currentWord.slice(0, typedWord.length + 1));
        }, TYPE_SPEED_MS);
      } else {
        timeoutId = setTimeout(() => {
          setPhase("deleting");
        }, WORD_PAUSE_MS);
      }
    } else if (phase === "deleting") {
      if (typedWord.length > 0) {
        timeoutId = setTimeout(() => {
          setTypedWord((prev) => prev.slice(0, -1));
        }, DELETE_SPEED_MS);
      } else {
        setWordIndex((prev) => (prev + 1) % WORDS.length);
        setPhase("typing");
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [phase, typedWord, currentWord]);

  return (
    <div className="mt-4 w-full px-2 sm:px-0">
      <p className="mx-auto min-h-[3.2rem] max-w-2xl text-center text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:min-h-[2.4rem] sm:text-lg">
        Turn interview stress into preparation that feels{" "}
        <span className="relative inline-block align-baseline text-left font-semibold text-blue-600 dark:text-blue-500">
          <span className="invisible select-none">{longestWord}</span>
          <span className="absolute inset-0 inline-flex items-center">
            {typedWord}
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse rounded bg-blue-600 dark:bg-blue-500"
            />
          </span>
        </span>
        .
      </p>
    </div>
  );
}
