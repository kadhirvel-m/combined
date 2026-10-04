import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { ClientMessage, SendFn, ServerMessage, ShowToast } from "../types";

interface SocketHandlers {
  /** Called once the socket is open (the page sends `join` here). */
  onOpen: (socket: WebSocket) => void;
  onMessage: (message: ServerMessage) => void | Promise<void>;
  showToast: ShowToast;
}

export interface GroupChatSocket {
  /** Open `url`. Any previous socket is left alone, as on the original (it only connects once). */
  connect: (url: string) => void;
  /** The original `sendWs`: JSON-encode and send; toasts when not connected unless `silent`. */
  send: SendFn;
  /** Close and forget the socket (the original `cleanupRoom`). */
  close: () => void;
  /** `ws !== null` — the chat form only checks that a socket exists. */
  hasSocket: () => boolean;
}

/**
 * The meeting's signalling socket. Mirrors the original exactly: no
 * automatic reconnect (a dropped socket only logs "[WS] Disconnected"), an
 * error toasts "Connection error". Closed on unmount.
 */
export function useGroupChatSocket(handlers: SocketHandlers): GroupChatSocket {
  const wsRef = useRef<WebSocket | null>(null);
  const latest = useRef(handlers);
  useLayoutEffect(() => {
    latest.current = handlers;
  });

  const connect = useCallback((url: string) => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      latest.current.onOpen(ws);
    };
    ws.onmessage = async (event: MessageEvent) => {
      const message = JSON.parse(String(event.data)) as ServerMessage;
      await latest.current.onMessage(message);
    };
    ws.onclose = () => {
      console.log("[WS] Disconnected");
    };
    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
      latest.current.showToast("Connection error", "error");
    };
  }, []);

  const send = useCallback<SendFn>((message: ClientMessage, opts = {}) => {
    const silent = !!opts.silent;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      if (!silent) latest.current.showToast("Not connected", "error");
      return false;
    }
    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch {
      if (!silent) latest.current.showToast("Send failed", "error");
      return false;
    }
  }, []);

  const close = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) ws.close();
  }, []);

  const hasSocket = useCallback(() => wsRef.current !== null, []);

  useEffect(() => {
    return () => {
      const ws = wsRef.current;
      wsRef.current = null;
      if (!ws) return;
      // Unmounting is not a user action: drop the handlers so nothing toasts or logs afterwards.
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      ws.close();
    };
  }, []);

  return { connect, send, close, hasSocket };
}
