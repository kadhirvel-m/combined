// Converted from ui/heart.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/heart/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata, Viewport } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Heart — The cardiac atlas · MediX",
  description: "An in-depth cardiac learning workspace for MBBS students. Explore real 3D anatomy, pressure–volume loops, ECGs, clinical cases, pharmacology and active recall.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f5f1",
};

export default function HeartPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      head={
        <>
          <link rel="icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=Instrument+Serif:ital@0;1&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/heart/heart.css" />
      <script type="importmap" dangerouslySetInnerHTML={{ __html: "{\"imports\":{\"three\":\"./assets/vendor/three/three.module.min.js\",\"three/addons/\":\"./assets/vendor/three/addons/\"}}" }} />
      {/* ── original <body> ── */}
      <a className="skip-link" href="#main">
        Skip to learning workspace
      </a>
      {" "}
      <aside className="sidebar" aria-label="Learning navigation">
        <a className="brand" href="mediX/chatbot.html">
          <span className="brand-symbol">
            m
            <span>
              ✳
            </span>
          </span>
          {" medi"}
          <span className="brand-x">
            X
          </span>
          <span className="brand-sub">
            LEARN
          </span>
        </a>
        {" "}
        <div className="course-label">
          YOUR LEARNING SPACE
        </div>
        {" "}
        <a className="course-name" href="#atlas">
          <span className="course-icon">
            ♥
          </span>
          <span>
            Cardiovascular system
            <small>
              MBBS · Integrated learning
            </small>
          </span>
        </a>
        {" "}
        <nav id="navigation" aria-label="Study tools">
          <a className="nav-item active" href="#atlas" data-view="atlas">
            <span className="nav-icon">
              ◈
            </span>
            3D anatomy atlas
            <span className="nav-arrow">
              ↗
            </span>
          </a>
          {" "}
          <a className="nav-item" href="#physiology" data-view="physiology">
            <span className="nav-icon">
              ∿
            </span>
            Physiology lab
          </a>
          {" "}
          <a className="nav-item" href="#ecg" data-view="ecg">
            <span className="nav-icon">
              ϟ
            </span>
            {"ECG & electrophysiology"}
          </a>
          {" "}
          <a className="nav-item" href="#cases" data-view="cases">
            <span className="nav-icon">
              ⊕
            </span>
            Clinical cases
          </a>
          {" "}
          <a className="nav-item" href="#curriculum" data-view="curriculum">
            <span className="nav-icon">
              ▤
            </span>
            Complete curriculum
          </a>
          {" "}
          <a className="nav-item" href="#recall" data-view="recall">
            <span className="nav-icon">
              ⌘
            </span>
            Active recall
          </a>
          {" "}
          <a className="nav-item" href="#references" data-view="references">
            <span className="nav-icon">
              ↗
            </span>
            {"References & model"}
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="progress-title">
            {"Your study progress "}
            <strong id="progress-percent">
              0%
            </strong>
          </div>
          <progress id="course-progress" max="100" value="0" aria-label="Curriculum completion" />
          <p id="progress-caption">
            0 lessons completed
          </p>
          <a href="#curriculum" className="continue-link">
            {"Continue learning "}
            <span>
              →
            </span>
          </a>
          <small>
            Progress is saved on this device.
          </small>
        </div>
        {" "}
        <a className="back-link" href="mediX/chatbot.html">
          ← Back to MediX
        </a>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            {"Medicine "}
            <span>
              /
            </span>
            {" Cardiovascular "}
            <span>
              /
            </span>
            {" "}
            <strong id="breadcrumb-current">
              Anatomy atlas
            </strong>
          </div>
          <div className="topbar-right">
            <span className="study-badge">
              <i />
              {" MBBS STUDY EDITION"}
            </span>
            <button
              className="icon-button"
              id="search-toggle"
              aria-label="Search curriculum"
              title="Search curriculum ( / )"
            >
              ⌕
            </button>
            <span className="avatar" aria-label="Medical student">
              MS
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {"THE CARDIAC ATLAS "}
                <span>
                  01 — CARDIOVASCULAR
                </span>
              </div>
              <h1>
                The heart.
                <em>
                  {" Understood."}
                </em>
              </h1>
              <p>
                From its first beat to clinical practice. Explore, experiment, and connect the dots.
              </p>
            </div>
            <a className="button button-dark heading-button" href="#curriculum">
              {"Explore the curriculum "}
              <span>
                ↗
              </span>
            </a>
          </div>
          <div className="mobile-nav" aria-label="Study sections">
            <select id="mobile-view" aria-label="Choose study section">
              <option value="atlas">
                3D anatomy atlas
              </option>
              <option value="physiology">
                Physiology lab
              </option>
              <option value="ecg">
                ECG studio
              </option>
              <option value="cases">
                Clinical cases
              </option>
              <option value="curriculum">
                Complete curriculum
              </option>
              <option value="recall">
                Active recall
              </option>
              <option value="references">
                References
              </option>
            </select>
          </div>
          <section id="view-atlas" className="view" aria-labelledby="atlas-title">
            <div className="section-bar">
              <h2 id="atlas-title">
                Anatomy, in another dimension.
              </h2>
              <span className="subtle">
                Interact with the real thing.
              </span>
            </div>
            <div className="atlas-layout">
              <div className="model-panel" id="model-panel">
                <div className="viewer-heading">
                  <span className="viewer-tag">
                    <i />
                    {" LIVE 3D EXPLORER"}
                  </span>
                  <span id="model-view-label">
                    Anterior view
                  </span>
                </div>
                <div
                  id="heart-viewer"
                  role="img"
                  aria-label="Interactive anatomical heart model. Drag to rotate, scroll to zoom, or use the view buttons and structure list."
                >
                  <div className="model-loading" id="model-status">
                    <span className="loader" />
                    Loading anatomical model…
                    <small>
                      Human Reference Atlas · 1.7 MB
                    </small>
                  </div>
                </div>
                <div className="model-caption">
                  <span>
                    HUMAN HEART
                  </span>
                  <small>
                    Visible Human dataset · Female
                  </small>
                </div>
                <div className="orientation">
                  <span>
                    SUPERIOR ↑
                  </span>
                  <span>
                    {"R "}
                    <i>
                      +
                    </i>
                    {" L"}
                  </span>
                </div>
                <div className="viewer-tools">
                  <button
                    id="model-rotate"
                    className="viewer-button"
                    aria-pressed="false"
                    title="Auto-rotate model"
                  >
                    {"↻ "}
                    <span>
                      Rotate
                    </span>
                  </button>
                  <button id="model-reset" className="viewer-button" title="Reset camera and anatomy controls">
                    {"⤢ "}
                    <span>
                      Reset
                    </span>
                  </button>
                  <button id="model-fullscreen" className="viewer-button" title="Expand 3D viewer">
                    {"⛶ "}
                    <span>
                      Expand
                    </span>
                  </button>
                </div>
                <div className="viewer-footer">
                  <span>
                    {"Drag to rotate "}
                    <i>
                      ·
                    </i>
                    {" Scroll / pinch to zoom "}
                    <i>
                      ·
                    </i>
                    {" Click a structure"}
                  </span>
                  <span className="model-license">
                    <a href="#references">
                      HRA · CC BY 4.0 ↗
                    </a>
                  </span>
                </div>
              </div>
              <aside className="anatomy-controls">
                <div className="control-head">
                  <span className="eyebrow">
                    EXPLORE THE ANATOMY
                  </span>
                  <span className="small-pill">
                    14 meshes
                  </span>
                </div>
                <div className="segmented" id="model-views" aria-label="Camera view">
                  <button data-camera="anterior" className="active" aria-pressed="true">
                    Anterior
                  </button>
                  <button data-camera="posterior" aria-pressed="false">
                    Posterior
                  </button>
                  <button data-camera="superior" aria-pressed="false">
                    Superior
                  </button>
                </div>
                {" "}
                <label className="field-label" htmlFor="structure-select">
                  {"Structure "}
                  <span>
                    SELECT TO HIGHLIGHT
                  </span>
                </label>
                <select id="structure-select">
                  <option value="all">
                    Whole heart
                  </option>
                  <optgroup label="Chambers">
                    <option value="left_ventricle">
                      Left ventricle
                    </option>
                    <option value="right_ventricle">
                      Right ventricle
                    </option>
                    <option value="left_cardiac_atrium">
                      Left atrium
                    </option>
                    <option value="right_cardiac_atrium">
                      Right atrium
                    </option>
                  </optgroup>
                  <optgroup label={"Valves & internal anatomy"}>
                    <option value="mitral_valve">
                      Mitral valve
                    </option>
                    <option value="tricuspid_valve">
                      Tricuspid valve
                    </option>
                    <option value="aortic_valve">
                      Aortic valve
                    </option>
                    <option value="pulmonary_valve">
                      Pulmonary valve
                    </option>
                    <option value="interventricular_septum">
                      Interventricular septum
                    </option>
                    <option value="papillary_muscle">
                      Papillary muscles
                    </option>
                  </optgroup>
                </select>
                {" "}
                <label className="switch-row">
                  <span>
                    Isolate selected structure
                    <small>
                      Hide surrounding anatomy
                    </small>
                  </span>
                  <input type="checkbox" id="isolate-toggle" role="switch" />
                </label>
                {" "}
                <label className="switch-row">
                  <span>
                    Color by structure
                    <small>
                      {"Differentiate chambers & valves"}
                    </small>
                  </span>
                  <input type="checkbox" id="color-toggle" role="switch" defaultChecked />
                </label>
                {" "}
                <label className="slider-label" htmlFor="opacity">
                  {"Surrounding opacity "}
                  <output id="opacity-value">
                    100%
                  </output>
                </label>
                <input id="opacity" type="range" min="10" max="100" defaultValue="100" />
                {" "}
                <label className="slider-label" htmlFor="cutaway">
                  {"Anatomical cutaway "}
                  <output id="cutaway-value">
                    Off
                  </output>
                </label>
                <input id="cutaway" type="range" min="0" max="100" defaultValue="0" />
                {" "}
                <div className="anatomy-note" id="structure-note" aria-live="polite" />
                {" "}
                <a className="text-link" href="#curriculum/gross-anatomy">
                  {"Study the detailed anatomy "}
                  <span>
                    →
                  </span>
                </a>
              </aside>
            </div>
            <div className="atlas-bottom">
              <div className="blood-flow-card">
                <div className="card-heading">
                  <div>
                    <span className="eyebrow">
                      FOLLOW THE FLOW
                    </span>
                    <h3>
                      One continuous circuit.
                    </h3>
                  </div>
                  <button id="flow-play" className="small-button" aria-pressed="false">
                    ▶ Follow blood flow
                  </button>
                </div>
                <div id="blood-flow" className="flow-path" />
                <p id="flow-description">
                  Select a step to trace its connections and pressure relationships.
                </p>
              </div>
              <a className="next-card" href="#physiology">
                <span className="eyebrow">
                  UNDERSTAND THE FUNCTION
                </span>
                <h3>
                  What changes when
                  <br />
                  afterload rises?
                </h3>
                <p>
                  Turn the dial. Watch the loop.
                </p>
                <span className="round-arrow">
                  ↗
                </span>
              </a>
            </div>
          </section>
          <section id="view-physiology" className="view" hidden aria-labelledby="phys-title" />
          <section id="view-ecg" className="view" hidden aria-labelledby="ecg-title" />
          <section id="view-cases" className="view" hidden aria-labelledby="cases-title" />
          <section id="view-curriculum" className="view" hidden aria-labelledby="curriculum-title" />
          <section id="view-recall" className="view" hidden aria-labelledby="recall-title" />
          <section id="view-references" className="view" hidden aria-labelledby="references-title" />
          <footer className="page-footer">
            <span>
              {"mediX "}
              <i>
                ·
              </i>
              {" Learn the mechanism. Understand the patient."}
            </span>
            <span>
              Educational simulations · Not a clinical decision tool
            </span>
          </footer>
        </main>
      </div>
      <div id="toast" role="status" className="toast" hidden />
      <noscript dangerouslySetInnerHTML={{ __html: "<div class=\"noscript\">Enable JavaScript to use the 3D atlas, lessons and simulations. <a href=\"https://www.ncbi.nlm.nih.gov/books/NBK482452/\">Read the anatomy reference</a>.</div>" }} />
      <script src="assets/heart/app.mjs" type="module" />
    </LegacyPage>
  );
}
