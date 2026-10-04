// Converted from ui/groupChat/group_chat.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/groupChat/group_chat/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Meeting Room — PaperX",
  description: "Real-time video meeting with screen sharing and collaborative tools",
};

export default function GroupChatGroupChatPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-gradient-to-br from-slate-100 to-purple-100 dark:from-[#0a0d12] dark:to-[#1a0f1c] text-[#0d1117] dark:text-zinc-100"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/groupChat/group_chat/style-01.css" />
      {/* ── original <body> ── */}
      {/* Participants Bar (Top Left) */}
      <div className="participants-bar glass-card" id="participantsBar" style={{ top: "20px" }}>
        <span className="icon text-lg opacity-60">
          group
        </span>
        {" "}
        <div id="participantAvatars" className="flex items-center">
          {/* Avatars will be added here */}
        </div>
        {" "}
        <span id="participantCount" className="text-sm font-medium opacity-70">
          0 in call
        </span>
      </div>
      {/* Top Right Actions */}
      <div className="fixed top-5 right-5 z-80 flex items-center gap-3">
        <button
          id="copyLinkBtn"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
          style={{ background: "rgba(30, 30, 47, 0.9)", color: "rgba(255,255,255,0.9)" }}
          title="Copy invite link"
        >
          <span className="icon text-lg">
            link
          </span>
          {" "}
          <span className="hidden sm:inline">
            Copy Link
          </span>
        </button>
        {" "}
        <button
          data-px-onclick="Theme.toggle()"
          className="p-2.5 rounded-xl transition"
          style={{ background: "rgba(30, 30, 47, 0.9)", color: "rgba(255,255,255,0.9)" }}
          title="Toggle theme"
          data-px=""
        >
          <span className="icon">
            dark_mode
          </span>
        </button>
      </div>
      {/* Main Content Area */}
      <main className="main-content" id="mainContent">
        <div className="p-4 h-full">
          <div className="video-container" id="mainVideoArea">
            <video id="screenShareVideo" autoPlay playsInline muted className="hidden" />
            {" "}
            <div id="noScreenShare" className="empty-video-state">
              <span className="icon">
                screen_share
              </span>
              {" "}
              <p className="text-lg font-medium">
                No screen being shared
              </p>
              <p className="text-sm opacity-60 mt-2">
                {"Click \"Share Screen\" to present"}
              </p>
            </div>
          </div>
        </div>
      </main>
      {/* Meeting Info Badge (Bottom Left) */}
      <div className="meeting-info-badge" id="meetingInfoBadge">
        <span id="currentTime">
          --:-- --
        </span>
        {" "}
        <span className="divider" />
        {" "}
        <span id="meetingId">
          ---
        </span>
      </div>
      {/* Floating Control Bar */}
      <div className="control-bar glass-card" id="controlBar" style={{ background: "rgba(30, 30, 47, 0.95)" }}>
        <button id="micBtn" className="control-btn active" title="Toggle microphone">
          <span className="icon">
            mic
          </span>
        </button>
        {" "}
        <button id="screenShareBtn" className="control-btn inactive" title="Share screen">
          <span className="icon">
            screen_share
          </span>
        </button>
        {" "}
        <div className="control-divider" />
        {" "}
        <button id="whiteboardBtn" className="control-btn inactive" title="Open Whiteboard">
          <span className="icon">
            draw
          </span>
        </button>
        {" "}
        <button id="chatToggleBtn" className="control-btn inactive" title="Toggle chat">
          <span className="icon">
            chat
          </span>
          {" "}
          <span id="chatBadge" className="notification-badge" style={{ display: "none" }}>
            0
          </span>
        </button>
        {" "}
        <div className="control-divider" />
        {" "}
        {/* Raise Hand */}
        <button id="raiseHandBtn" className="control-btn inactive" title="Raise hand">
          <span className="icon">
            back_hand
          </span>
        </button>
        {" "}
        {/* Reactions */}
        <div className="relative">
          <button id="reactionsBtn" className="control-btn inactive" title="Reactions">
            <span className="icon">
              sentiment_satisfied
            </span>
          </button>
          {" "}
          <div className="reactions-popup" id="reactionsPopup">
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/1.svg">
              <img src="../assets/reactions-svg/1.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/2.svg">
              <img src="../assets/reactions-svg/2.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/3.svg">
              <img src="../assets/reactions-svg/3.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/4.svg">
              <img src="../assets/reactions-svg/4.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/5.svg">
              <img src="../assets/reactions-svg/5.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/6.svg">
              <img src="../assets/reactions-svg/6.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/7.svg">
              <img src="../assets/reactions-svg/7.svg" alt="reaction" />
            </button>
            {" "}
            <button className="reaction-btn" data-reaction="../assets/reactions-svg/8.svg">
              <img src="../assets/reactions-svg/8.svg" alt="reaction" />
            </button>
          </div>
        </div>
        {/* Host Controls */}
        <div className="relative" id="hostControlsContainer" style={{ display: "none" }}>
          <button id="hostControlsBtn" className="control-btn inactive" title="Host controls">
            <span className="icon">
              admin_panel_settings
            </span>
          </button>
          {" "}
          <div className="host-popup" id="hostPopup">
            <div className="host-option" id="muteAllBtn">
              <span className="icon">
                volume_off
              </span>
              {" Mute all "}
            </div>
            <div className="host-option" id="copyInviteBtn">
              <span className="icon">
                person_add
              </span>
              {" Invite link "}
            </div>
            <div className="host-option danger" id="endMeetingBtn">
              <span className="icon">
                call_end
              </span>
              {" End meeting for all "}
            </div>
          </div>
        </div>
        <div className="control-divider" />
        {" "}
        {/* Leave Button */}
        <button id="leaveBtn" className="control-btn danger" title="Leave meeting">
          <span className="icon">
            call_end
          </span>
        </button>
      </div>
      {/* Chat Sidebar */}
      <aside className="chat-sidebar glass-card" id="chatSidebar">
        <div className="chat-header">
          <div className="flex items-center gap-3">
            <span className="icon text-xl" style={{ color: "var(--brand-500)" }}>
              chat_bubble
            </span>
            {" "}
            <h2 className="font-semibold text-lg">
              Chat
            </h2>
          </div>
          {" "}
          <button
            id="closeChatBtn"
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <span className="icon">
              close
            </span>
          </button>
        </div>
        <div className="chat-messages" id="chatMessages">
          {/* Chat messages will appear here */}
          <div className="text-center py-8 opacity-50">
            <span className="icon text-4xl mb-2">
              forum
            </span>
            {" "}
            <p className="text-sm">
              Messages will appear here
            </p>
          </div>
        </div>
        <div className="chat-input-area">
          <form id="chatForm" className="chat-input-wrapper">
            <input
              type="text"
              id="chatInput"
              className="chat-input"
              placeholder="Type a message..."
              autoComplete="off"
            />
            {" "}
            <button type="submit" className="chat-send-btn">
              <span className="icon">
                send
              </span>
            </button>
          </form>
        </div>
      </aside>
      {/* Floating Action Buttons (Bottom Right) */}
      <div className="floating-actions" id="floatingActions">
        <button className="fab-btn" id="participantsFab" title="Participants">
          <span className="icon">
            people
          </span>
        </button>
        {" "}
        <button className="fab-btn" id="hostControlsFab" title="Host Controls" style={{ display: "none" }}>
          <span className="icon">
            admin_panel_settings
          </span>
        </button>
      </div>
      {/* Participants Sidebar */}
      <aside className="right-sidebar" id="participantsSidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <span className="icon text-xl" style={{ color: "var(--brand-500)" }}>
              people
            </span>
            {" "}
            <h2 className="font-semibold text-lg">
              Participants
            </h2>
            {" "}
            <span id="participantsCount" className="text-sm opacity-60">
              (0)
            </span>
          </div>
          {" "}
          <button
            id="closeParticipantsBtn"
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <span className="icon">
              close
            </span>
          </button>
        </div>
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2">
            <span className="icon opacity-60">
              search
            </span>
            {" "}
            <input
              id="participantsSearch"
              type="text"
              placeholder="Search participants"
              autoComplete="off"
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </div>
        <div className="sidebar-content" id="participantsList">
          {/* Participants will be added here */}
          <div className="text-center py-8 opacity-50">
            <span className="icon text-4xl mb-2">
              person_search
            </span>
            {" "}
            <p className="text-sm">
              No participants yet
            </p>
          </div>
        </div>
      </aside>
      {/* Host Controls Sidebar */}
      <aside className="right-sidebar" id="hostControlsSidebar">
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <span className="icon text-xl" style={{ color: "var(--brand-500)" }}>
              admin_panel_settings
            </span>
            {" "}
            <h2 className="font-semibold text-lg">
              Host Controls
            </h2>
          </div>
          {" "}
          <button
            id="closeHostControlsBtn"
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <span className="icon">
              close
            </span>
          </button>
        </div>
        <div className="sidebar-content">
          {/* Chat Moderation Section */}
          <div className="settings-section">
            <div className="section-header">
              Chat Moderation
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Let participants send messages
                </div>
                <div className="setting-description">
                  When on, everyone in the call can send messages
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleChat" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
          </div>
          {/* Meeting Access Section */}
          <div className="settings-section">
            <div className="section-header">
              Meeting Access
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Host must join before anyone else
                </div>
                <div className="setting-description">
                  Participants wait until host joins
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleHostFirst" />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Lock meeting
                </div>
                <div className="setting-description">
                  When on, no new participants can join
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleLockMeeting" />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Waiting room
                </div>
                <div className="setting-description">
                  When on, participants must be admitted by a host/co-host
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleWaitingRoom" />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="section-header" style={{ marginTop: "16px" }}>
              Meeting access type
            </div>
            <div className="radio-group" id="accessTypeGroup">
              <div className="radio-option selected" data-value="open">
                <div className="radio-circle" />
                <div className="radio-info">
                  <h5>
                    Open
                  </h5>
                  <p>
                    No one has to ask to join. Anyone can dial in.
                  </p>
                </div>
              </div>
              <div className="radio-option" data-value="trusted">
                <div className="radio-circle" />
                <div className="radio-info">
                  <h5>
                    Trusted
                  </h5>
                  <p>
                    {"People can join without asking if they're invited using their account."}
                  </p>
                  <div className="sub-toggle">
                    <input type="checkbox" id="allowAskToJoin" defaultChecked />
                    {" "}
                    <span>
                      Anyone with the meeting link can ask to join
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Meeting Moderation Section */}
          <div className="settings-section">
            <div className="section-header">
              Meeting Moderation
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Host management
                </div>
                <div className="setting-description">
                  Lets you restrict what contributors can enable
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleHostManagement" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="section-header" style={{ marginTop: "16px" }}>
              Let Contributors
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Share their screen
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleScreenShare" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Send reactions
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleReactions" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Allow participants to unmute
                </div>
                <div className="setting-description">
                  When off, participants can’t unmute themselves
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleMic" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">
                  Allow participants to start camera
                </div>
                <div className="setting-description">
                  When off, participants can’t start their camera
                </div>
              </div>
              {" "}
              <label className="toggle-switch">
                {" "}
                <input type="checkbox" id="toggleVideo" defaultChecked />
                {" "}
                <span className="toggle-slider" />
                {" "}
              </label>
            </div>
          </div>
          {/* Host Tools */}
          <div className="settings-section" id="hostToolsSection" style={{ display: "none" }}>
            <div className="section-header">
              Host Tools
            </div>
            {" "}
            <button className="danger-btn" id="hostMuteAllBtn" style={{ marginTop: "0" }}>
              <span className="icon">
                volume_off
              </span>
              {" Mute all participants "}
            </button>
            {" "}
            <button
              className="danger-btn"
              id="hostCopyInviteBtn"
              style={{ marginTop: "10px", background: "rgba(158, 75, 138, 0.12)", color: "inherit" }}
            >
              <span className="icon">
                person_add
              </span>
              {" Copy invite link "}
            </button>
          </div>
          {/* Join Requests */}
          <div className="settings-section" id="joinRequestsSection" style={{ display: "none" }}>
            <div className="section-header">
              Join Requests
            </div>
            <div id="joinRequestsList" className="space-y-2" />
          </div>
          {" "}
          {/* Danger Zone */}
          <button className="danger-btn" id="hostEndMeetingBtn">
            <span className="icon">
              call_end
            </span>
            {" End meeting for everyone "}
          </button>
        </div>
      </aside>
      {/* Meeting Ended View */}
      <div className="ended-view" id="endedView">
        <div className="ended-card glass-card">
          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-full mb-6"
            style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)" }}
          >
            <span className="icon text-5xl text-red-500">
              call_end
            </span>
          </div>
          {" "}
          <h1 className="text-3xl font-bold mb-3">
            Call Ended
          </h1>
          <p className="text-lg opacity-60 mb-8">
            This meeting has ended and is no longer active.
          </p>
          {" "}
          <a
            href="group_history.html"
            className="block w-full py-3.5 rounded-2xl font-semibold text-white text-center"
            style={{ background: "var(--brand-gradient)" }}
          >
            {" "}
            <span className="icon align-middle mr-2">
              history
            </span>
            {" Go to Call History "}
          </a>
          {" "}
          <a href="../index.html" className="block mt-4 text-sm opacity-50 hover:opacity-100 transition">
            {" Return to Home "}
          </a>
        </div>
      </div>
      {/* Toast */}
      <div className="toast glass-card" id="toast">
        <span id="toastIcon" className="icon" style={{ color: "var(--brand-500)" }}>
          check_circle
        </span>
        {" "}
        <span id="toastText" />
      </div>
      {" "}
      {/* Screen-share Marker Overlay + Toolkit */}
      <canvas
        id="markerCanvas"
        style={{ position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "85", pointerEvents: "none", display: "none" }}
      />
      {" "}
      <button
        id="markerFab"
        className="fab-btn"
        title="Marker"
        style={{ position: "fixed", right: "20px", bottom: "118px", zIndex: "90", display: "none" }}
      >
        <span className="icon">
          edit
        </span>
      </button>
      {" "}
      <div
        id="markerToolkit"
        className="glass-card"
        style={{ position: "fixed", right: "20px", bottom: "180px", zIndex: "90", display: "none", padding: "10px", borderRadius: "16px", gap: "10px", alignItems: "center" }}
      >
        <button id="markerPenBtn" className="control-btn active" title="Pen">
          <span className="icon">
            draw
          </span>
        </button>
        {" "}
        <button id="markerEraserBtn" className="control-btn inactive" title="Eraser">
          <span className="icon">
            ink_eraser
          </span>
        </button>
        {" "}
        <input
          id="markerColor"
          type="color"
          defaultValue="#ff0000"
          title="Color"
          style={{ width: "38px", height: "38px", borderRadius: "10px", border: "none", background: "transparent" }}
        />
        {" "}
        <input id="markerSize" type="range" min="2" max="18" defaultValue="6" title="Size" />
        {" "}
        <button id="markerClearBtn" className="control-btn inactive" title="Clear">
          <span className="icon">
            delete_sweep
          </span>
        </button>
        {" "}
        <button id="markerCloseBtn" className="control-btn inactive" title="Close">
          <span className="icon">
            close
          </span>
        </button>
      </div>
      <script src="/_legacy/groupChat/group_chat/script-01.js" />
    </LegacyPage>
  );
}
