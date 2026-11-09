#!/usr/bin/env node
"use strict";

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const QUIZ_FILE = path.join(__dirname, "quiz.json");

const DEFAULT_QUIZ = [
  {
    question: "HTTPステータスコード 404 の意味は？",
    choices: ["サーバーエラー", "リダイレクト", "見つからない", "認証が必要"],
    answer: 2,
  },
  {
    question: "HTMLで段落を表すタグは？",
    choices: ["<div>", "<span>", "<p>", "<br>"],
    answer: 2,
  },
  {
    question: "CSSでクラスセレクタに使う記号は？",
    choices: ["#", ".", "@", "&"],
    answer: 1,
  },
  {
    question: "JavaScriptで配列の長さを取得するプロパティは？",
    choices: ["size", "count", "length", "total"],
    answer: 2,
  },
  {
    question: "GitでリモートリポジトリのURLを確認するコマンドは？",
    choices: ["git log", "git remote -v", "git status", "git diff"],
    answer: 1,
  },
  {
    question: "JSONの正式名称は？",
    choices: [
      "JavaScript Object Notation",
      "JavaScript Online Network",
      "Java Serialized Object Notation",
      "JavaScript Oriented Naming",
    ],
    answer: 0,
  },
  {
    question: "SQLで全行を取得するとき、WHERE句の代わりに省略できるのは？",
    choices: [
      "WHERE ALL",
      "WHERE *",
      "WHERE句自体を省略",
      "WHERE TRUE のみ可",
    ],
    answer: 2,
  },
  {
    question: "LinuxでファイルのパーミッションをRWXR-XR-Xにする数値は？",
    choices: ["644", "755", "777", "700"],
    answer: 1,
  },
  {
    question: "TCP/IPモデルのトランスポート層に属するプロトコルは？",
    choices: ["HTTP", "IP", "TCP", "ARP"],
    answer: 2,
  },
  {
    question: "UTF-8で日本語1文字は通常何バイト？",
    choices: ["1バイト", "2バイト", "3バイト", "4バイト"],
    answer: 2,
  },
];

function loadQuiz() {
  if (fs.existsSync(QUIZ_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(QUIZ_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // デフォルトにフォールバック
    }
  }
  return DEFAULT_QUIZ;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer.trim()));
  });
}

async function main() {
  const allQuestions = loadQuiz();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("========================================");
  console.log("  クイズゲーム");
  console.log("========================================");
  console.log();

  const countInput = await ask(
    rl,
    `出題数を選んでください (1-${allQuestions.length}, Enter で全問): `
  );
  const count =
    countInput === ""
      ? allQuestions.length
      : Math.max(1, Math.min(allQuestions.length, parseInt(countInput, 10) || allQuestions.length));

  const questions = shuffle(allQuestions).slice(0, count);
  let correct = 0;
  const results = [];

  console.log();
  console.log(`全 ${questions.length} 問を出題します。`);
  console.log();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`--- 第${i + 1}問 / ${questions.length}問 ---`);
    console.log(q.question);
    console.log();
    q.choices.forEach((c, idx) => {
      console.log(`  ${idx + 1}. ${c}`);
    });
    console.log();

    let userAnswer = -1;
    while (true) {
      const input = await ask(rl, "回答 (番号): ");
      const num = parseInt(input, 10);
      if (num >= 1 && num <= q.choices.length) {
        userAnswer = num - 1;
        break;
      }
      console.log(`1-${q.choices.length} の番号を入力してください`);
    }

    const isCorrect = userAnswer === q.answer;
    if (isCorrect) {
      correct++;
      console.log("  -> 正解!\n");
    } else {
      console.log(`  -> 不正解... 正解は ${q.answer + 1}. ${q.choices[q.answer]}\n`);
    }
    results.push({ question: q.question, isCorrect, yourAnswer: q.choices[userAnswer], correctAnswer: q.choices[q.answer] });
  }

  console.log("========================================");
  console.log("  結果発表");
  console.log("========================================");
  console.log();
  console.log(`正解数: ${correct} / ${questions.length}`);
  const pct = ((correct / questions.length) * 100).toFixed(1);
  console.log(`正解率: ${pct}%`);
  console.log();

  let grade;
  if (pct >= 90) grade = "素晴らしい!";
  else if (pct >= 70) grade = "よくできました!";
  else if (pct >= 50) grade = "もう少しがんばろう!";
  else grade = "復習してみよう!";
  console.log(`評価: ${grade}`);
  console.log();

  const showDetail = await ask(rl, "詳細を表示しますか？ (y/N): ");
  if (showDetail.toLowerCase() === "y") {
    console.log();
    results.forEach((r, idx) => {
      const mark = r.isCorrect ? "o" : "x";
      console.log(`  [${mark}] ${idx + 1}. ${r.question}`);
      if (!r.isCorrect) {
        console.log(`       あなたの回答: ${r.yourAnswer}`);
        console.log(`       正解:         ${r.correctAnswer}`);
      }
    });
    console.log();
  }

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
