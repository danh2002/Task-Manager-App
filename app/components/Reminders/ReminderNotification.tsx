"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { useGlobalState } from "@/app/context/globalProvider";
import axios from "axios";
import toast from "react-hot-toast";

interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminder: string;
  dueDate?: string;
  board?: { name: string };
  column?: { name: string };
}

// Sound for reminder notification
const playReminderSound = () => {
  try {
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback: create beep with Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    });
  } catch (e) {
    console.log("Could not play sound:", e);
  }
};

// Request notification permission
const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Show desktop notification
const showDesktopNotification = (title: string, body: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "reminder",
      requireInteraction: true,
    });
  }
};

const ReminderNotification: React.FC = () => {
  const { theme } = useGlobalState();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const processedReminders = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    
    window.addEventListener("click", initAudio, { once: true });
    window.addEventListener("keydown", initAudio, { once: true });
    
    return () => {
      window.removeEventListener("click", initAudio);
      window.removeEventListener("keydown", initAudio);
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Check for reminders with high precision
  const checkReminders = useCallback(async () => {
    try {
      const now = new Date();
      const res = await axios.get("/api/reminders");
      
      if (res.data.success && res.data.data.length > 0) {
        const newReminders = res.data.data.filter((reminder: Reminder) => {
          // Skip if already processed
          if (processedReminders.current.has(reminder.id)) return false;
          
          const reminderTime = new Date(reminder.reminder);
          const diffMs = reminderTime.getTime() - now.getTime();
          const diffSeconds = diffMs / 1000;
          
          // Trigger if reminder time is within last 5 seconds or upcoming in 5 seconds
          // This ensures we catch it even if there's a slight delay
          return diffSeconds >= -5 && diffSeconds <= 5;
        });

        if (newReminders.length > 0) {
          // Add to processed set
          newReminders.forEach((r: Reminder) => processedReminders.current.add(r.id));
          
          setReminders(prev => [...prev, ...newReminders]);
          setShowNotification(true);
          
          // Process each reminder immediately
          newReminders.forEach((reminder: Reminder) => {
            // Play sound
            playReminderSound();
            
            // Show desktop notification
            const timeStr = new Date(reminder.reminder).toLocaleTimeString([], { 
              hour: "2-digit", 
              minute: "2-digit" 
            });
            showDesktopNotification(
              "🔔 Task Reminder",
              `"${reminder.title}" - Due at ${timeStr}`
            );
            
            // Show immediate toast
            toast(
              <div>
                <strong>🔔 Reminder: {reminder.title}</strong>
                <div style={{ fontSize: "0.9em", marginTop: "4px" }}>
                  Due now at {timeStr}
                  {reminder.board && <div>📋 {reminder.board.name}</div>}
                </div>
              </div>,
              {
                duration: 10000, // 10 seconds
                icon: "⏰",
                style: {
                  background: theme.colorBg2,
                  color: theme.colorGrey0,
                  border: `2px solid ${theme.colorPrimary}`,
                  fontSize: "1rem",
                  padding: "16px",
                },
              }
            );
            
            // Mark reminder as sent on server
            axios.post("/api/reminders/mark-sent", { taskId: reminder.id })
              .catch(err => console.error("Failed to mark reminder:", err));
          });
        }
      }
    } catch (error) {
      console.error("Error checking reminders:", error);
    }
  }, [theme]);

  // Check immediately and then every 5 seconds for precise timing
  useEffect(() => {
    // Check immediately on mount
    checkReminders();

    // Check every 5 seconds for more precise timing
    const interval = setInterval(checkReminders, 5000);

    return () => clearInterval(interval);
  }, [checkReminders]);


  if (!showNotification || reminders.length === 0) return null;

  return (
    <NotificationContainer theme={theme}>
      <NotificationHeader theme={theme}>
        <BellIcon>🔔</BellIcon>
        <Title theme={theme}>Reminders</Title>
        <CloseButton theme={theme} onClick={() => setShowNotification(false)}>×</CloseButton>
      </NotificationHeader>
      <ReminderList>
        {reminders.map((reminder) => (
          <ReminderItem key={reminder.id} theme={theme}>
            <ReminderTitle theme={theme}>{reminder.title}</ReminderTitle>
            {reminder.description && (
              <ReminderDesc theme={theme}>{reminder.description}</ReminderDesc>
            )}
            <ReminderMeta theme={theme}>
              {reminder.board && <span>📋 {reminder.board.name}</span>}
              {reminder.column && <span>📂 {reminder.column.name}</span>}
              {reminder.dueDate && (
                <span>📅 Due: {new Date(reminder.dueDate).toLocaleDateString()}</span>
              )}
            </ReminderMeta>
          </ReminderItem>
        ))}
      </ReminderList>
    </NotificationContainer>
  );
};

const NotificationContainer = styled.div<{ theme: any }>`
  position: fixed;
  top: 80px;
  right: 20px;
  width: 350px;
  max-height: 400px;
  background: ${(props) => props.theme.colorBg2};
  border: 2px solid ${(props) => props.theme.colorPrimary};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
`;

const NotificationHeader = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: ${(props) => props.theme.colorPrimary}20;
  border-bottom: 1px solid ${(props) => props.theme.borderColor2};
`;

const BellIcon = styled.span`
  font-size: 1.5rem;
`;

const Title = styled.h3<{ theme: any }>`
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
  color: ${(props) => props.theme.colorGrey0};
`;

const CloseButton = styled.button<{ theme: any }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${(props) => props.theme.colorGrey2};
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colorBg3};
    color: ${(props) => props.theme.colorGrey0};
  }
`;

const ReminderList = styled.div`
  max-height: 320px;
  overflow-y: auto;
  padding: 10px;
`;

const ReminderItem = styled.div<{ theme: any }>`
  padding: 12px;
  margin-bottom: 8px;
  background: ${(props) => props.theme.colorBg3};
  border-radius: 8px;
  border-left: 3px solid ${(props) => props.theme.colorPrimary};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReminderTitle = styled.h4<{ theme: any }>`
  margin: 0 0 5px 0;
  font-size: 0.95rem;
  color: ${(props) => props.theme.colorGrey0};
`;

const ReminderDesc = styled.p<{ theme: any }>`
  margin: 0 0 8px 0;
  font-size: 0.85rem;
  color: ${(props) => props.theme.colorGrey1};
  line-height: 1.4;
`;

const ReminderMeta = styled.div<{ theme: any }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.75rem;
  color: ${(props) => props.theme.colorGrey2};

  span {
    background: ${(props) => props.theme.colorBg2};
    padding: 3px 8px;
    border-radius: 4px;
  }
`;

export default ReminderNotification;
