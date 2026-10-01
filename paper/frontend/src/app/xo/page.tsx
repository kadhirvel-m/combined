// Converted from ui/xo.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/xo/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — XO Arena",
  description: "Play Tic-Tac-Toe against AI or friends on PaperX. Challenge yourself with Easy, Medium, or Hard difficulty levels.",
};

export default function XoPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,1,0&display=swap"}
        rel="stylesheet"
      />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/xo/style-01.css" />
      {/* ── original <body> ── */}
      {/* Ambient Background */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-1" />
        <div className="ambient-orb orb-2" />
        <div className="ambient-orb orb-3" />
      </div>
      {/* Header */}
      <header className="xo-header glass">
        <div className="xo-header-inner">
          <a href="index.html" className="logo">
            <span>
              Paper X
            </span>
          </a>
          {" "}
          <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>
            —
          </span>
          {" "}
          <span style={{ fontSize: ".85rem", fontWeight: "600" }}>
            XO Arena
          </span>
          {" "}
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            <button id="statsToggle" className="chip" data-px-onclick="toggleStats()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>
                leaderboard
              </span>
              {" Stats "}
            </button>
            {" "}
            <button id="themeBtn" className="chip" data-px-onclick="toggleTheme()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="xo-container">
        {/* ═══ MODE SELECTION SCREEN ═══ */}
        <div id="modeScreen">
          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h1 className="page-title">
              <span className="gradient-text">
                XO Arena
              </span>
            </h1>
            <p className="page-subtitle" style={{ margin: "8px auto 0" }}>
              Challenge the AI or battle a friend. Choose your difficulty and prove your strategy.
            </p>
          </div>
          {/* Stats Bar (collapsed by default) */}
          <div id="statsSection" style={{ display: "none" }}>
            <div style={{ marginTop: "24px" }}>
              <h2 className="section-title">
                Your Stats
              </h2>
              <p className="section-subtitle">
                Track your progress across all games
              </p>
            </div>
            <div className="stats-bar" id="statsBar">
              <div className="stat-card glass">
                <div className="stat-value" id="statWins">
                  0
                </div>
                <div className="stat-label">
                  Wins
                </div>
              </div>
              <div className="stat-card glass">
                <div className="stat-value" id="statLosses">
                  0
                </div>
                <div className="stat-label">
                  Losses
                </div>
              </div>
              <div className="stat-card glass">
                <div className="stat-value" id="statDraws">
                  0
                </div>
                <div className="stat-label">
                  Draws
                </div>
              </div>
              <div className="stat-card glass">
                <div className="stat-value" id="statStreak">
                  0
                </div>
                <div className="stat-label">
                  Streak
                </div>
              </div>
              <div className="stat-card glass">
                <div className="stat-value" id="statElo">
                  1000
                </div>
                <div className="stat-label">
                  ELO
                </div>
              </div>
              <div className="stat-card glass">
                <div className="stat-value" id="statPlayed">
                  0
                </div>
                <div className="stat-label">
                  Played
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "32px" }}>
            <h2 className="section-title">
              Choose Mode
            </h2>
            <p className="section-subtitle">
              Select your challenge level
            </p>
          </div>
          <div className="mode-grid">
            <div
              className="mode-card glass easy"
              data-px-onclick="startGame('ai_easy')"
              id="modeEasy"
              data-px=""
            >
              <span className="mode-icon">
                🤖
              </span>
              {" "}
              <h3>
                AI Easy
              </h3>
              <p>
                Perfect for beginners. The AI makes random moves.
              </p>
              <div className="difficulty-bar">
                <div className="difficulty-fill" />
              </div>
            </div>
            <div
              className="mode-card glass medium"
              data-px-onclick="startGame('ai_medium')"
              id="modeMedium"
              data-px=""
            >
              <span className="mode-icon">
                🧠
              </span>
              {" "}
              <h3>
                AI Medium
              </h3>
              <p>
                A balanced challenge. 50/50 smart and random moves.
              </p>
              <div className="difficulty-bar">
                <div className="difficulty-fill" />
              </div>
            </div>
            <div
              className="mode-card glass hard"
              data-px-onclick="startGame('ai_hard')"
              id="modeHard"
              data-px=""
            >
              <span className="mode-icon">
                👑
              </span>
              {" "}
              <h3>
                AI Hard
              </h3>
              <p>
                Unbeatable minimax AI. Can you force a draw?
              </p>
              <div className="difficulty-bar">
                <div className="difficulty-fill" />
              </div>
            </div>
            <div
              className="mode-card glass friend"
              data-px-onclick="startGame('friend')"
              id="modeFriend"
              data-px=""
            >
              <span className="mode-icon">
                🤝
              </span>
              {" "}
              <h3>
                Friend
              </h3>
              <p>
                {"Pass & play with a friend on the same device."}
              </p>
              <div className="difficulty-bar">
                <div className="difficulty-fill" />
              </div>
            </div>
          </div>
        </div>
        {/* ═══ GAME AREA ═══ */}
        <div id="gameArea" className="game-area">
          {/* Game HUD */}
          <div className="game-hud">
            <div className="player-card glass" id="playerXCard">
              <div className="player-marker x-marker">
                X
              </div>
              <div className="player-info">
                <h4 id="playerXName">
                  You
                </h4>
                <p id="playerXScore">
                  Score: 0
                </p>
              </div>
            </div>
            <div className="score-display glass">
              <div id="turnIndicator" className="turn-badge glass" style={{ marginBottom: "6px" }}>
                <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>
                  radio_button_checked
                </span>
                {" "}
                <span id="turnText">
                  Your Turn
                </span>
              </div>
              <div className="score-value" id="roundDisplay">
                Round 1
              </div>
              <div className="score-label" id="modeLabel">
                AI Easy
              </div>
            </div>
            <div className="player-card glass" id="playerOCard">
              <div className="player-marker o-marker">
                O
              </div>
              <div className="player-info">
                <h4 id="playerOName">
                  AI
                </h4>
                <p id="playerOScore">
                  Score: 0
                </p>
              </div>
            </div>
          </div>
          {/* Board */}
          <div className="board-wrapper">
            <div className="board" id="board">
              <div className="cell glass" data-row="0" data-col="0" data-px-onclick="makeMove(0,0)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="0" data-col="1" data-px-onclick="makeMove(0,1)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="0" data-col="2" data-px-onclick="makeMove(0,2)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="1" data-col="0" data-px-onclick="makeMove(1,0)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="1" data-col="1" data-px-onclick="makeMove(1,1)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="1" data-col="2" data-px-onclick="makeMove(1,2)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="2" data-col="0" data-px-onclick="makeMove(2,0)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="2" data-col="1" data-px-onclick="makeMove(2,1)" data-px="">
                <span className="marker" />
              </div>
              <div className="cell glass" data-row="2" data-col="2" data-px-onclick="makeMove(2,2)" data-px="">
                <span className="marker" />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            <button className="btn-ghost" data-px-onclick="backToMenu()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>
                arrow_back
              </span>
              {" Menu "}
            </button>
            {" "}
            <button className="btn-ghost" data-px-onclick="resetBoard()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>
                refresh
              </span>
              {" New Round "}
            </button>
          </div>
        </div>
      </div>
      {/* Result Overlay */}
      <div className="result-overlay" id="resultOverlay">
        <div className="result-card glass" id="resultCard">
          <span className="result-emoji" id="resultEmoji">
            🎉
          </span>
          {" "}
          <h2 id="resultTitle">
            You Win!
          </h2>
          <p id="resultSubtitle">
            Amazing strategy! You conquered the board.
          </p>
          <div className="result-actions">
            <button className="btn-primary" data-px-onclick="playAgain()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>
                replay
              </span>
              {" Play Again "}
            </button>
            {" "}
            <button className="btn-ghost" data-px-onclick="backToMenu()" data-px="">
              <span className="material-symbols-rounded" style={{ fontSize: "18px" }}>
                home
              </span>
              {" Menu "}
            </button>
          </div>
        </div>
      </div>
      {/* Confetti Container */}
      <div className="confetti-container" id="confettiContainer" />
      <script src="/_legacy/xo/script-01.js" />
    </LegacyPage>
  );
}
