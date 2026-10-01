// Converted from ui/math_td.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/math_td/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Math Tower Defense",
};

export default function MathTdPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/math_td/style-01.css" />
      {/* ── original <body> ── */}
      <div className="app">
        <aside className="sidebar">
          <div className="profile">
            <div>
              <span className="avatar">
                🧠
              </span>
              <strong id="playerName">
                Player
              </strong>
            </div>
            <div className="hp">
              {"Castle HP: "}
              <span id="playerHp">
                2000
              </span>
            </div>
          </div>
          <div style={{ opacity: ".7", fontSize: "12px", lineHeight: "1.4" }}>
            {" Solo mode: solve math to earn elixir, deploy units, defend your castle. "}
          </div>
        </aside>
        <main className="center">
          <section className="battle-wrap">
            <canvas id="battlefield" width="720" height="540" />
            {" "}
            <div className="hud-row">
              <span id="timer">
                Time: 0.0s
              </span>
              {" "}
              <span id="unitCount">
                Units: 0
              </span>
            </div>
            <div id="resultOverlay" className="overlay">
              <h2 id="resultTitle" style={{ margin: "0", fontSize: "36px" }}>
                Victory
              </h2>
              <p id="resultText" style={{ margin: "0", fontSize: "16px" }}>
                Game finished
              </p>
              {" "}
              <button className="menu-btn" data-px-onclick="location.href='/ui/index.html'" data-px="">
                Back to Main Menu
              </button>
            </div>
          </section>
          <section className="bottom">
            <div className="panel">
              <div className="title">
                Math / Educational Panel
              </div>
              <div id="questionText" className="question">
                Loading question...
              </div>
              <div id="answers" className="answers" />
              <div id="answerStatus" className="status">
                Select the correct answer.
              </div>
              {" "}
              <button id="submitAnswer" className="action-btn">
                Generate Elixir
              </button>
            </div>
            <div className="panel">
              <div className="title">
                {"Deck & Resource Bar"}
              </div>
              <div className="elixir-top">
                <span>
                  Elixir
                </span>
                {" "}
                <span>
                  <span id="elixirValue">
                    0.0
                  </span>
                  {" / 10"}
                </span>
              </div>
              <div className="elixir-bar">
                <div id="elixirFill" className="elixir-fill" />
              </div>
              <div id="deck" className="deck" />
            </div>
          </section>
        </main>
        <aside className="sidebar">
          <div className="profile">
            <div>
              <span className="avatar">
                🤖
              </span>
              <strong id="enemyName">
                Enemy AI
              </strong>
            </div>
            <div className="hp">
              {"Castle HP: "}
              <span id="enemyHp">
                2000
              </span>
            </div>
          </div>
          <div style={{ opacity: ".7", fontSize: "12px", lineHeight: "1.4" }}>
            {" Enemy AI automatically deploys troops from the top lane. "}
          </div>
        </aside>
      </div>
      <script src="/_legacy/math_td/script-01.js" />
    </LegacyPage>
  );
}
