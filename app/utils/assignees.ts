export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "danh", name: "Danh", avatar: "/avatar.jpg" },
  { id: "linh", name: "Linh" },
  { id: "khanh", name: "Khanh" },
  { id: "minh", name: "Minh" },
];

export const MEMBER_BY_ID: Record<string, TeamMember> = TEAM_MEMBERS.reduce((acc, member) => {
  acc[member.id] = member;
  return acc;
}, {} as Record<string, TeamMember>);
