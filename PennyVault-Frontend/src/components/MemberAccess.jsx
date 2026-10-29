import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../Styles/PeopleAccess.css";
import {
  IconUsers,
  IconShield,
  IconMail,
  IconEye,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconDotsVertical,
  IconUserOff,
  IconUserCheck,
  IconPlus,
  IconX,
  IconCopy,
  IconRefresh,
} from "@tabler/icons-react";
import { getUser } from "../utils/auth";
import {
  cancelHouseholdInvitation,
  createHouseholdInvitation,
  getHouseholdInvitations,
  getHouseholdMembers,
  resendHouseholdInvitation,
  setHouseholdMemberActive,
  updateHouseholdMemberRole,
} from "../services/householdAccessService";

const ROLE_LABELS = {
  OWNER: "Primary Owner",
  CO_OWNER: "Co-owner",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_CLASSES = {
  OWNER: "primary-owner",
  CO_OWNER: "owner",
  MEMBER: "member",
  VIEWER: "viewer",
};

const ROLE_OPTIONS = [
  { value: "CO_OWNER", label: "Co-owner" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const formatExpiry = (value) => {
  if (!value) return "Expiry unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Expiry unavailable";
  if (date.getTime() <= Date.now()) return "Expired";
  return `Expires ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
};

const initialsFor = (name = "") =>
  name.trim().split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

const colorFor = (value = "") => {
  const colors = ["purple", "green", "blue", "teal", "pink"];
  return colors[[...value].reduce((sum, character) => sum + character.charCodeAt(0), 0) % colors.length];
};

function PeopleAccess() {
  const user = getUser();
  const householdId = user?.householdId;
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [activeMenu, setActiveMenu] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [createdToken, setCreatedToken] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canManage = currentRole === "OWNER";
  const activeMembers = useMemo(
    () => members.filter((member) => member.active),
    [members]
  );
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesSearch = !query ||
        `${member.fullName || ""} ${member.email || ""}`.toLowerCase().includes(query);
      const matchesFilter = filter === "ALL" ||
        (filter === "ACTIVE" && member.active) ||
        (filter === "INACTIVE" && !member.active) ||
        member.role === filter;
      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const loadData = useCallback(async () => {
    if (!householdId) {
      setError("Your signed-in profile does not include a household ID. Please sign out and sign in again after confirming your account has a household.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const memberData = await getHouseholdMembers(householdId);
      const safeMembers = Array.isArray(memberData) ? memberData : [];
      setMembers(safeMembers);
      const ownMembership = safeMembers.find((member) => String(member.userId) === String(user?.id));
      setCurrentRole(ownMembership?.role || null);

      if (ownMembership?.role === "OWNER") {
        const invitationData = await getHouseholdInvitations(householdId);
        setInvitations(Array.isArray(invitationData) ? invitationData : []);
      } else {
        setInvitations([]);
      }
    } catch (requestError) {
      setError(requestError?.message || "Unable to load household access details.");
    } finally {
      setLoading(false);
    }
  }, [householdId, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(successMessage);
      setActiveMenu(null);
      await loadData();
    } catch (requestError) {
      setError(requestError?.message || "The requested action could not be completed.");
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) {
      setError("Enter an email address to invite.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    setCreatedToken("");
    try {
      const invitation = await createHouseholdInvitation(
        householdId,
        inviteEmail.trim(),
        inviteRole
      );
      setCreatedToken(invitation?.invitationToken || "");
      setInviteEmail("");
      setShowInviteForm(false);
      setNotice("Invitation created. Email delivery is not configured yet; share the token securely with the invited person.");
      await loadData();
    } catch (requestError) {
      setError(requestError?.message || "Unable to create invitation.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyToken = async () => {
    if (!createdToken) return;
    try {
      await navigator.clipboard.writeText(createdToken);
      setNotice("Invitation token copied.");
    } catch {
      setNotice(`Copy the invitation token manually: ${createdToken}`);
    }
  };

  const handleRoleChange = (member, role) => {
    if (role === member.role) return;
    if (!window.confirm(`Change ${member.fullName}'s role to ${ROLE_LABELS[role]}?`)) return;
    runAction(
      () => updateHouseholdMemberRole(householdId, member.userId, role),
      `${member.fullName}'s role was updated.`
    );
  };

  const handleMemberActive = (member) => {
    const nextActive = !member.active;
    const actionLabel = nextActive ? "reactivate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${member.fullName}?`)) return;
    runAction(
      () => setHouseholdMemberActive(householdId, member.userId, nextActive),
      `${member.fullName} was ${nextActive ? "reactivated" : "deactivated"}.`
    );
  };

  const handleResend = (invitation) => runAction(
    async () => {
      const response = await resendHouseholdInvitation(householdId, invitation.id);
      setCreatedToken(response?.invitationToken || "");
      setNotice("Invitation refreshed. Email delivery is not configured yet; share the new token securely.");
    },
    "Invitation refreshed."
  );

  const handleCancel = (invitation) => {
    if (!window.confirm(`Cancel the invitation for ${invitation.email}?`)) return;
    runAction(
      () => cancelHouseholdInvitation(householdId, invitation.id),
      "Invitation cancelled."
    );
  };

  const ownerCount = activeMembers.filter((member) => member.role === "OWNER" || member.role === "CO_OWNER").length;
  const viewerCount = activeMembers.filter((member) => member.role === "VIEWER").length;
  const pendingCount = invitations.filter((invitation) => invitation.status === "PENDING").length;

  return (
    <div className="people-access-content">
      <div className="people-page-header">
        <div>
          <h1>People &amp; Access</h1>
          <p>Manage household members, invitations, roles and access.</p>
        </div>
        {canManage && (
          <button className="invite-button" onClick={() => { setShowInviteForm(true); setError(""); }}>
            <IconPlus size={16} stroke={2.5} /> Invite People
          </button>
        )}
      </div>

      {error && <div className="people-alert error" role="alert">{error}</div>}
      {notice && <div className="people-alert success" role="status">{notice}</div>}
      {createdToken && (
        <div className="invitation-token-panel">
          <div>
            <strong>Invitation token</strong>
            <p>Share this token securely with the invited person. They must sign in using the invited email and accept the invitation.</p>
            <code>{createdToken}</code>
          </div>
          <button type="button" className="outline-action" onClick={handleCopyToken}>
            <IconCopy size={14} /> Copy token
          </button>
          <button type="button" className="token-dismiss" aria-label="Dismiss token" onClick={() => setCreatedToken("")}><IconX size={16} /></button>
        </div>
      )}

      {showInviteForm && (
        <form className="invite-form-panel" onSubmit={handleInvite}>
          <div className="invite-form-heading">
            <div><h2>Invite a household member</h2><p>Choose the role they should receive.</p></div>
            <button type="button" className="token-dismiss" aria-label="Close invite form" onClick={() => setShowInviteForm(false)}><IconX size={18} /></button>
          </div>
          <label htmlFor="invite-email">Email address</label>
          <input id="invite-email" type="email" required maxLength={254} value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@example.com" />
          <label htmlFor="invite-role">Role</label>
          <select id="invite-role" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}>
            {ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
          </select>
          <div className="invite-form-actions">
            <button type="button" className="filter-button" onClick={() => setShowInviteForm(false)}>Cancel</button>
            <button type="submit" className="invite-button" disabled={saving}>{saving ? "Sending..." : "Create invitation"}</button>
          </div>
        </form>
      )}

      <div className="people-summary-grid">
        <SummaryCard icon={<IconUsers size={22} stroke={2} />} title="Total Members" value={String(members.length)} subtitle={`${activeMembers.length} active members`} color="purple" />
        <SummaryCard icon={<IconShield size={22} stroke={2} />} title="Owners" value={String(ownerCount)} subtitle="Primary & co-owners" color="green" />
        {canManage && <SummaryCard icon={<IconMail size={22} stroke={2} />} title="Pending Invitations" value={String(pendingCount)} subtitle="Awaiting acceptance" color="orange" />}
        <SummaryCard icon={<IconEye size={22} stroke={2} />} title="Viewers" value={String(viewerCount)} subtitle="Read-only access" color="blue" />
      </div>

      <div className="people-toolbar">
        <div className="people-search">
          <IconSearch size={18} stroke={2} />
          <input type="text" placeholder="Search members by name or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="people-filter-wrap">
          <IconFilter size={15} stroke={2} />
          <select aria-label="Filter members" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="ALL">All members</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Deactivated</option>
            <option value="CO_OWNER">Co-owners</option>
            <option value="MEMBER">Members</option>
            <option value="VIEWER">Viewers</option>
          </select>
          <IconChevronDown size={15} stroke={2} />
        </div>
      </div>

      <section className="members-section">
        <div className="active-members-section">
          <h2>Household Members</h2>
          <span className="count-badge">{filteredMembers.length}</span>
        </div>
        <div className="members-card">
          {loading ? (
            <div className="people-empty-state">Loading household members…</div>
          ) : filteredMembers.length === 0 ? (
            <div className="people-empty-state">{members.length ? "No members match your search or filter." : "No household members were found."}</div>
          ) : filteredMembers.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              canManage={canManage}
              isSelf={String(member.userId) === String(user?.id)}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onRoleChange={handleRoleChange}
              onToggleActive={handleMemberActive}
              saving={saving}
            />
          ))}
        </div>
      </section>

      {canManage && (
        <section className="invitations-section">
          <div className="pending-members-section">
            <h2>Invitations</h2>
            <span className="count-badge">{invitations.length}</span>
          </div>
          {loading ? <div className="people-empty-state">Loading invitations…</div> : invitations.length === 0 ? (
            <div className="people-empty-state">No invitations yet. Use Invite People to invite someone to this household.</div>
          ) : (
            <div className="invitation-grid">
              {invitations.map((invitation) => (
                <InvitationCard key={invitation.id} invite={invitation} onResend={handleResend} onCancel={handleCancel} saving={saving} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="summary-card">
      <div className={`summary-icon ${color}`}>{icon}</div>
      <div className="summary-info">
        <span>{title}</span><strong>{value}</strong><small className={color}>{subtitle}</small>
      </div>
    </div>
  );
}

function MemberRow({ member, canManage, isSelf, activeMenu, setActiveMenu, onRoleChange, onToggleActive, saving }) {
  const isMenuOpen = activeMenu === member.userId;
  const roleLabel = ROLE_LABELS[member.role] || member.role || "Member";
  const color = colorFor(member.email);
  return (
    <div className={`member-row ${member.active ? "" : "member-row-inactive"}`}>
      <div className="member-profile">
        <div className={`member-avatar ${color}`}>
          {initialsFor(member.fullName)}
          {member.active && <span className="online-dot" />}
        </div>
        <div className="member-role-info">
          <div className="member-name-line">
            <strong>{member.fullName || "Unnamed member"}</strong>
            <span className={`role-badge ${ROLE_CLASSES[member.role] || "member"}`}>{roleLabel}</span>
            {!member.active && <span className="inactive-badge">Deactivated</span>}
            {isSelf && <span className="you-badge">You</span>}
          </div>
          <div className="member-email"><IconMail size={13} stroke={2} />{member.email}</div>
          <div className={`member-status ${member.active ? "" : "inactive-status"}`}>{member.active ? "Active member" : "Access deactivated"}</div>
        </div>
      </div>

      <div className="member-stat">
        <span>Joined household</span>
        <strong>{formatDate(member.joinedAt)}</strong>
        <small className="member-stat-note">Spending insights not connected yet</small>
      </div>

      <div className="member-stat transaction-stat">
        <span>Access</span>
        <strong>{member.active ? "Enabled" : "Disabled"}</strong>
        <small className="member-stat-note">{member.deactivatedAt ? `Updated ${formatDate(member.deactivatedAt)}` : "Membership status"}</small>
      </div>

      <div className="member-joined">
        <strong>{roleLabel}</strong>
        <span>{member.active ? "Can access household" : "Cannot access household"}</span>
      </div>

      <div className="member-actions">
        {canManage && member.role !== "OWNER" && !isSelf ? (
          <>
            <label className="member-role-select-label">
              <span>Change role</span>
              <select aria-label={`Change role for ${member.fullName}`} value={member.role} disabled={saving} onChange={(event) => onRoleChange(member, event.target.value)}>
                {ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
              </select>
            </label>
            <button className="menu-button" disabled={saving} aria-label={`More actions for ${member.fullName}`} onClick={() => setActiveMenu(isMenuOpen ? null : member.userId)}>
              <IconDotsVertical size={16} stroke={2} />
            </button>
            {isMenuOpen && (
              <div className="member-menu">
                <button disabled={saving} onClick={() => onToggleActive(member)}>
                  {member.active ? <IconUserOff size={14} /> : <IconUserCheck size={14} />}
                  {member.active ? "Deactivate member" : "Reactivate member"}
                </button>
              </div>
            )}
          </>
        ) : <span className="member-action-note">{member.role === "OWNER" ? "Owner protected" : "Your access"}</span>}
      </div>
    </div>
  );
}

function InvitationCard({ invite, onResend, onCancel, saving }) {
  const color = colorFor(invite.email);
  const status = invite.status || "PENDING";
  const isPending = status === "PENDING";
  const canResend = isPending || status === "EXPIRED";
  return (
    <div className="invitation-card">
      <div className={`invitation-icon ${color}`}><IconMail size={19} stroke={2} /></div>
      <div className="invitation-content">
        <div className="invitation-top">
          <div><strong>{invite.email}</strong><span>{ROLE_LABELS[invite.role] || invite.role}</span></div>
          <span className={`pending-badge ${status.toLowerCase()}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
        </div>
        <div className="invitation-bottom">
          <div><span>Created {formatDate(invite.createdAt)}</span><small>{formatExpiry(invite.expiresAt)}</small></div>
          <div className="invitation-actions">
            {canResend && <button disabled={saving} onClick={() => onResend(invite)}><IconRefresh size={12} /> Resend</button>}
            {isPending && <button className="cancel-button" disabled={saving} onClick={() => onCancel(invite)}>Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeopleAccess;
