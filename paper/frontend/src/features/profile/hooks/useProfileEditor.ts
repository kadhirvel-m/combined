"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { fetchEditableProfile, putProfile, uploadProfileAsset } from "../api";
import { buildEditPayload, editorReducer, initialEditorState, initialsFor } from "../lib/editForm";

/**
 * Full-screen loader: shown while the profile loads (then fades out and
 * leaves 450ms later), and again, opaque, while saving (it disappears 450ms
 * after the save settles, without a fade).
 */
export type EditLoader = "loading" | "fading" | "saving" | "saved" | "gone";

/** Left card: what the original wrote into #email, #name, the avatar and the "View current" links. */
export interface EditIdentity {
  name: string;
  email: string;
  initials: string;
  imageUrl: string | null;
  resumeUrl: string | null;
}

const EMPTY_IDENTITY: EditIdentity = { name: "—", email: "—", initials: "U", imageUrl: null, resumeUrl: null };

/**
 * State and actions of profile_edit.html: loads the profile (GET
 * /api/profile/me, falling back to /api/me), keeps the form rows, and saves
 * (optional image/resume uploads, then PUT /api/profile/me → academicas.html).
 */
export function useProfileEditor() {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);
  const [identity, setIdentity] = useState<EditIdentity>(EMPTY_IDENTITY);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  // null keeps the status line hidden (until the first save).
  const [status, setStatus] = useState<string | null>(null);
  const [loader, setLoader] = useState<EditLoader>("loading");
  const started = useRef(false);
  // The submit handler reads the rows after its uploads, as the original read the DOM.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const load = async () => {
      try {
        const result = await fetchEditableProfile();
        if (result.status === "unauthorized") {
          hardNavigate("/login.html");
          return;
        }
        const data = result.profile;
        if (!data) return;
        setIdentity({
          name: data.name ? String(data.name) : "—",
          email: data.email ? String(data.email) : "—",
          initials: initialsFor(data.name),
          imageUrl: data.profile_image_url ? String(data.profile_image_url) : null,
          resumeUrl: data.resume_url ? String(data.resume_url) : null,
        });
        dispatch({ type: "load", profile: data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoader((current) => (current === "loading" ? "fading" : current));
      }
    };
    void load();
  }, []);

  // The loader leaves the page 450ms after loading or saving settles.
  useEffect(() => {
    if (loader !== "fading" && loader !== "saved") return;
    const timer = setTimeout(() => setLoader("gone"), 450);
    return () => clearTimeout(timer);
  }, [loader]);

  // Release the preview's object URL when it is replaced or the page unmounts.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  /** A new profile image was picked: preview it in the avatar right away. */
  const pickImage = useCallback((file: File | null) => {
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }, []);

  const pickResume = useCallback((file: File | null) => setResumeFile(file), []);

  /** The details form's submit (runs after native validation passed). */
  const save = useCallback(async () => {
    setLoader("saving");
    try {
      setStatus((current) => current ?? "");
      if (imageFile) {
        setStatus("⏳ Uploading profile image…");
        const up = await uploadProfileAsset("image", imageFile);
        if (!up.ok) {
          setStatus(`❌ ${String(up.out.detail || "Image upload failed")}`);
          return;
        }
      }
      if (resumeFile) {
        setStatus("⏳ Uploading resume…");
        const up = await uploadProfileAsset("resume", resumeFile);
        if (!up.ok) {
          setStatus(`❌ ${String(up.out.detail || "Resume upload failed")}`);
          return;
        }
      }
      const res = await putProfile(buildEditPayload(latest.current));
      setStatus(res.ok ? "✔ Profile updated" : `❌ ${String(res.out.detail || "Update failed")}`);
      if (res.ok) hardNavigate("/academicas.html");
    } catch (err) {
      console.error(err);
    } finally {
      setLoader("saved");
    }
  }, [imageFile, resumeFile]);

  /** "Sign Out": drops the legacy token key and goes to the login page (no /logout call). */
  const signOut = useCallback(() => {
    try {
      localStorage.removeItem("px_token");
    } catch {}
    hardNavigate("/login.html");
  }, []);

  return {
    state,
    dispatch,
    identity,
    avatarUrl: preview ?? identity.imageUrl,
    pickImage,
    pickResume,
    status,
    loader,
    save,
    signOut,
  };
}

export type ProfileEditor = ReturnType<typeof useProfileEditor>;
