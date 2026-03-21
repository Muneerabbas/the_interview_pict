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
    <div className="mt-5 w-full px-2 sm:px-0">
      <p className="mx-auto max-w-3xl text-center text-base font-medium leading-relaxed text-slate-600 sm:text-lg md:text-xl">
        Turn interview stress into preparation that feels{" "}
        <span className="inline-flex min-w-[9ch] items-center justify-start font-semibold text-blue-700">
          {typedWord}
          <span
            aria-hidden="true"
            className="ml-1 inline-block h-[1.1em] w-[2px] animate-pulse rounded bg-blue-700"
          />
        </span>
        .
      </p>
    </div>
  );
}
