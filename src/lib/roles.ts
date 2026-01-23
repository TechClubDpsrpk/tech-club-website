export const ROLES = {
    DEVELOPER: 'developer',
    PRESIDENT: 'president',
    VP: 'vice_president',
    ADMIN: 'admin',
    PR: 'pr',
    MENTOR: 'mentor',
    // User is implied if no other role
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Hierarchy/Capabilities definitions
// Note: "Developer" is super-admin. "President" and "VP" are high-level core.

export function hasRole(userRoles: string[] | undefined | null, role: Role): boolean {
    if (!userRoles) return false;
    return userRoles.includes(role);
}

// Check if user has ANY of the required roles
export function hasAnyRole(userRoles: string[] | undefined | null, requiredRoles: Role[]): boolean {
    if (!userRoles) return false;
    // Developers always have access (Super Admin)
    if (userRoles.includes(ROLES.DEVELOPER)) return true;

    return requiredRoles.some(role => userRoles.includes(role));
}

export function canManageRoles(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    return hasAnyRole(userRoles, [ROLES.DEVELOPER, ROLES.PRESIDENT, ROLES.VP]);
}

export function canCreateAnnouncements(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    // PR, Developer, President, VP can create announcements? 
    // User said: "PR who will be able to create announcements", "Developer who are basically even above president"
    // Assuming President/VP/Core should also be able to, or is it strictly PR?
    // User said: "PR who will be able to create announcements but cannot assign quests"
    // Let's stick to Developer and PR for now, maybe Core too. 
    // Let's assume Core (President/VP) generally has broad permissions, but the user specifically mentioned PR for this.
    // I will include President/VP/Admin for now as they were previously "Admins", but the user wants separation.
    // "all admins are in core... any admin can make anyone admin... I want only president and VP to be able to do that"
    // The user didn't explicitly restrict "Announcements" from President/VP, but let's just add Developer and PR as requested for the specific "PR" role.
    // Wait, "Developer... can do anything". So Developer is definitely in.
    // Let's assume President/VP are still powerful.

    // Safe bet: Developer, President, VP, PR.
    return hasAnyRole(userRoles, [ROLES.DEVELOPER, ROLES.PRESIDENT, ROLES.VP, ROLES.PR]);
}

export function canAssignQuests(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    // Mentors can assign quests.
    // Developer can do anything.
    // President/VP likely should be able to as well? 
    // For now: Developer, President, VP, Mentor.
    // NOTE: Core (ADMIN) explicitly excluded as per user request to hide Projects tab.
    return hasAnyRole(userRoles, [ROLES.DEVELOPER, ROLES.PRESIDENT, ROLES.VP, ROLES.MENTOR]);
}

export function isSuperAdmin(userRoles: string[] | undefined | null): boolean {
    return hasRole(userRoles, ROLES.DEVELOPER);
}

export function canManageSiteAccess(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    return hasAnyRole(userRoles, [ROLES.DEVELOPER, ROLES.PRESIDENT, ROLES.VP]);
}

export function hasAccessToAdminPanel(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    // Any role (that is not empty) gives basic access to admin panel
    return userRoles.length > 0;
}

export function canViewUsers(userRoles: string[] | undefined | null): boolean {
    if (!userRoles) return false;
    // Developer, President, VP, and Core (Admin) can view users.
    return hasAnyRole(userRoles, [ROLES.DEVELOPER, ROLES.PRESIDENT, ROLES.VP, ROLES.ADMIN]);
}
