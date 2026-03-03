// GitLab-inspired Theme
const themes = [
  {
    name: "dark",
    // GitLab Dark Theme Colors
    colorBg: "#1f2937",          // Dark gray background
    colorBg2: "#111827",         // Darker card background
    colorBg3: "#0f172a",         // Darkest for sidebar
    colorBg4: "#1e293b",         // Hover states
    colorButton: "#374151",
    colorDanger: "#ef4444",
    colorBlue: "#3b82f6",
    colorRed: "#ef4444",
    colorGreen: "#22c55e",
    colorFontPrimary: "#f3f4f6",
    colorTextSecondary: "#9ca3af",
    colorTextPrimary: "#f9fafb",
    colorTextLight: "#f3f4f6",
    colorbackground: "#1f2937",
    colorGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",  // Purple gradient like GitLab
    colorGreenDark: "#22c55e",
    colorGreenLight: "#86efac",
    activeNavLink: "rgba(99, 102, 241, 0.2)",  // Purple active state
    activeNavLinkHover: "rgba(99, 102, 241, 0.1)",
    colorPrimary: "#6366f1",      // GitLab purple
    colorPrimary2: "#8b5cf6",
    colorGreyDark: "#0f172a",
    colorGrey0: "#f3f4f6",        // Light text
    colorGrey1: "#d1d5db",        // Secondary text
    colorGrey2: "#9ca3af",        // Muted text
    colorGrey3: "#6b7280",        // Disabled text
    colorGrey4: "#4b5563",        // Border text
    colorGrey5: "#374151",        // Darker borders
    colorGrey6: "#1f2937",        // Darkest
    colorWhite: "#ffffff",
    colorPrimaryGreen: "#22c55e",
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderColor2: "#374151",      // Dark border
    shadow7: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
    sidebarWidth: "16rem",
    sidebarCollapsed: "4rem",
    fH4: "19px",
    fontSmall: "14px",
    fontSmall2: "15px",
    gridGap: "2rem",
    padLRSm: "0 2rem",
    colorIcons: "#9ca3af",
    colorIcons2: "#f3f4f6",
    colorIcons3: "rgba(99, 102, 241, 0.2)",
    colorIcons4: "rgba(0, 0, 0, 0.3)",
    marLRSm: "0 1rem",
    // GitLab specific
    gitlabPurple: "#6366f1",
    gitlabOrange: "#f97316",
    gitlabGreen: "#22c55e",
  },
  {
    name: "light",
    // GitLab Light Theme Colors
    colorBg: "#f9fafb",
    colorBg2: "#ffffff",
    colorBg3: "#f3f4f6",
    colorBg4: "#e5e7eb",
    colorButton: "#6b7280",
    colorDanger: "#dc2626",
    colorBlue: "#2563eb",
    colorRed: "#dc2626",
    colorGreen: "#16a34a",
    colorFontPrimary: "#1f2937",
    colorTextSecondary: "#6b7280",
    colorTextPrimary: "#111827",
    colorTextLight: "#374151",
    colorbackground: "#ffffff",
    colorGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    colorGreenDark: "#16a34a",
    colorGreenLight: "#bbf7d0",
    activeNavLink: "rgba(99, 102, 241, 0.1)",
    activeNavLinkHover: "rgba(99, 102, 241, 0.05)",
    colorPrimary: "#6366f1",      // GitLab purple
    colorPrimary2: "#4f46e5",
    colorGreyDark: "#1f2937",
    colorGrey0: "#111827",
    colorGrey1: "#374151",
    colorGrey2: "#6b7280",
    colorGrey3: "#9ca3af",
    colorGrey4: "#d1d5db",
    colorGrey5: "#e5e7eb",
    colorGrey6: "#f3f4f6",
    colorWhite: "#ffffff",
    buttonGradient1: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    buttonGradient2: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient3: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient4: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
    buttonGradient5: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient6: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient7: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    buttonGradient8: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient9: "linear-gradient(135deg, #eab308 0%, #f97316 100%)",
    buttonGradient10: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
    buttonGradient11: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
    buttonGradient12: "linear-gradient(135deg, #eab308 0%, #f97316 100%)",
    buttonGradient13: "linear-gradient(135deg, #eab308 0%, #9333ea 100%)",
    buttonGradient14: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    borderRadiusMd: "8px",
    borderRadiusMd2: "10px",
    borderRadiusSm: "6px",
    borderColor: "#e5e7eb",
    borderColor2: "#d1d5db",
    shadow1: "0 1px 3px rgba(0, 0, 0, 0.1)",
    shadow2: "0 4px 6px rgba(0, 0, 0, 0.1)",
    shadow3: "0 10px 15px rgba(0, 0, 0, 0.1)",
    shadow7: "0 4px 6px rgba(0, 0, 0, 0.1)",
    shadow5: "0 2px 4px rgba(0, 0, 0, 0.1)",
    shadow6: "0 4px 6px rgba(0, 0, 0, 0.1), 0 -2px 4px rgba(0, 0, 0, 0.05)",
    sidebarWidth: "16rem",
    sidebarCollapsed: "4rem",
    fH4: "19px",
    fontSmall: "14px",
    fontSmall2: "15px",
    gridGap: "2rem",
    padLRSm: "0 2rem",
    colorIcons: "#6b7280",
    colorIcons2: "#1f2937",
    colorIcons3: "rgba(99, 102, 241, 0.1)",
    colorIcons4: "rgba(0, 0, 0, 0.05)",
    marLRSm: "0 1rem",
    // GitLab specific
    gitlabPurple: "#6366f1",
    gitlabOrange: "#f97316",
    gitlabGreen: "#22c55e",
  },
];
export default themes;
