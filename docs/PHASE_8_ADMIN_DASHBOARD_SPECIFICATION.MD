# PHASE 8: ADMIN DASHBOARD SPECIFICATION

This view allows for high-level management of user expression and poll integrity.

## 1. UI Layout (`app/admin/dashboard/page.tsx`)
The layout follows a "Command Center" aesthetic with the following sections:

* **Global Ecosystem Stats**: Real-time counts of Total Profiles, Active Archetypes, and "Dormant" users.
* **Voter Directory (Table)**: A searchable list of all users displaying their current Role, Spirit Emoji, and calculated Archetype.
* **Action Panel**: Contextual buttons for each user to "Impersonate", "Reset Bio", or "Change Role".

## 2. Admin Impersonation Logic
To simulate a user's local experience, the "Impersonate" button triggers a session-wide override.

-- TS START --
// components/admin/UserRow.tsx
export const UserRow = ({ profile }: { profile: Profile }) => {
  const { setImpersonatedId } = useAdmin(); // Global context

  return (
    <tr className="hover:bg-gray-800 transition-colors">
      <td>{profile.spirit_emoji} {profile.username}</td>
      <td><span className="text-xs border px-2 py-0.5 rounded" style={{ borderColor: profile.aura_color }}>{profile.role}</span></td>
      <td>{profile.archetype || "Calculating..."}</td>
      <td>
        <button 
          onClick={() => setImpersonatedId(profile.id)} //
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs"
        >
          Debug: View As
        </button>
      </td>
    </tr>
  );
};
-- TS END --

## 3. Global Override Features
Admins can bypass standard creator-only restrictions on the following:

* **Poll Hard-Reset**: Forcing a poll status from `ACTIVE` back to `DRAFT` or to `REMOVED`.
* **Aura Reset**: Resetting a user's `aura_color` or `bio` if it violates community standards.
* **Time Warp**: Extending or shortening a poll's `end_time` logic by overriding the `polls` table.