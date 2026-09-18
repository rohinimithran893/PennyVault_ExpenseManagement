import React, { useState } from "react";
import "../Styles/PeopleAccess.css";
import {
  IconUsers,
  IconShield,
  IconMail,
  IconEye,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconEdit,
  IconDotsVertical,
  IconUserOff,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";

const members = [
  {
    initials: "SA",
    name: "Saravana Kumar",
    email: "saravana@email.com",
    role: "Co-owner",
    roleClass: "owner",
    status: "Active now",
    spent: 12000,
    percentage: 68,
    transactions: 42,
    joined: "Feb 2024",
    ago: "1 year ago",
    color: "green",
  },
  {
    initials: "RO",
    name: "Rohini",
    email: "rohini@email.com",
    role: "Primary Owner",
    roleClass: "primary-owner",
    status: "Active now",
    spent: 45000,
    percentage: 78,
    transactions: 84,
    joined: "Jan 2023",
    ago: "2 years ago",
    color: "purple",
  },
  {
    initials: "VA",
    name: "Varun",
    email: "varun@email.com",
    role: "Member",
    roleClass: "member",
    status: "Active 2h ago",
    spent: 8500,
    percentage: 52,
    transactions: 21,
    joined: "May 2024",
    ago: "10 months ago",
    color: "blue",
  },
  {
    initials: "AV",
    name: "Arjun",
    email: "arjun@email.com",
    role: "Member",
    roleClass: "member",
    status: "Active yesterday",
    spent: 5000,
    percentage: 40,
    transactions: 12,
    joined: "Mar 2024",
    ago: "1 year ago",
    color: "teal",
  },
  {
    initials: "ME",
    name: "Meera",
    email: "meera@email.com",
    role: "Viewer",
    roleClass: "viewer",
    status: "Active 3d ago",
    spent: 0,
    percentage: 0,
    transactions: 0,
    joined: "Apr 2024",
    ago: "1 year ago",
    color: "pink",
  },
];

const invitations = [
  {
    name: "Arun",
    email: "arun@gmail.com",
    sent: "Sent 2 days ago",
    expires: "Expires in 5 days",
    color: "purple",
  },
  {
    name: "Priya",
    email: "priya@gmail.com",
    sent: "Sent 1 day ago",
    expires: "Expires in 6 days",
    color: "orange",
  },
  {
    name: "Karthik",
    email: "karthik@gmail.com",
    sent: "Sent 5 hours ago",
    expires: "Expires in 6 days",
    color: "blue",
  },
];

function PeopleAccess() {
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="people-access-content">
      {/* PAGE HEADER */}
      <div className="people-page-header">
        <div>
          <h1>People &amp; Access</h1>
          <p>Manage members, invitations, roles and access to SpendNest.</p>
        </div>

        <button className="invite-button">
          <IconPlus size={16} stroke={2.5} />
          Invite Member
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="people-summary-grid">
        <SummaryCard
          icon={<IconUsers size={22} stroke={2} />}
          title="Total Members"
          value="8"
          subtitle="5 active members"
          color="purple"
        />

        <SummaryCard
          icon={<IconShield size={22} stroke={2} />}
          title="Owners"
          value="2"
          subtitle="Primary & co-owners"
          color="green"
        />

        <SummaryCard
          icon={<IconMail size={22} stroke={2} />}
          title="Pending Invitations"
          value="3"
          subtitle="Invitations sent"
          color="orange"
        />

        <SummaryCard
          icon={<IconEye size={22} stroke={2} />}
          title="Viewers"
          value="1"
          subtitle="Read-only access"
          color="blue"
        />
      </div>

      {/* SEARCH */}
      <div className="people-toolbar">
        <div className="people-search">
          <IconSearch size={18} stroke={2} />

          <input
            type="text"
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="filter-button">
          <IconFilter size={15} stroke={2} />
          Filter
           <IconChevronDown size={15} stroke={2} />
        </button>
      </div>

      {/* ACTIVE MEMBERS */}
      <section className="members-section">
        <div className="active-members-section">
          <h2>Active Members</h2>
          <span className="count-badge">{filteredMembers.length}</span>
        </div>

        <div className="members-card">
          {filteredMembers.map((member) => (
            <MemberRow
              key={member.email}
              member={member}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
          ))}
        </div>
      </section>

      {/* PENDING INVITATIONS */}
      <section className="invitations-section">
        <div className="pending-members-section">
          <h2>Pending Invitations</h2>
          <span className="count-badge">3</span>
        </div>

        <div className="invitation-grid">
          {invitations.map((invite) => (
            <InvitationCard
              key={invite.email}
              invite={invite}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------------- SUMMARY CARD ---------------- */

function SummaryCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="summary-card">
      <div className={`summary-icon ${color}`}>
        {icon}
      </div>

      <div className="summary-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small className={color}>{subtitle}</small>
      </div>
    </div>
  );
}

/* ---------------- MEMBER ROW ---------------- */

function MemberRow({
  member,
  activeMenu,
  setActiveMenu,
}) {
  const isMenuOpen = activeMenu === member.email;

  return (
    <div className="member-row">
      {/* MEMBER */}
      <div className="member-profile">
        <div className={`member-avatar ${member.color}`}>
          {member.initials}
          <span className="online-dot" />
        </div>

        <div className="member-role-info">
          <div className="member-name-line">
            <strong>{member.name}</strong>

            <span className={`role-badge ${member.roleClass}`}>
              {member.role}
            </span>
          </div>

          <div className="member-email">
             <IconMail size={13} stroke={2} />
             {member.email}
          </div>

          <div className="member-status">
            {member.status}
          </div>
        </div>
      </div>

      {/* SPENDING */}
      <div className="member-stat spending-stat">
        <span>Spent this month</span>

        <strong>
          ₹{member.spent.toLocaleString("en-IN")}
        </strong>

        <div className="spending-progress">
          <div
            className={`progress-fill ${member.color}`}
            style={{ width: `${member.percentage}%` }}
          />
        </div>

        <small>{member.percentage}%</small>
      </div>

      {/* TRANSACTIONS */}
      <div className="member-stat transaction-stat">
        <span>Transactions</span>

        <strong>{member.transactions}</strong>

        <div className={`mini-chart ${member.color}`}>
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      {/* JOINED */}
      <div className="member-joined">
        <strong>Joined {member.joined}</strong>
        <span>{member.ago}</span>
      </div>

      {/* ACTIONS */}
      <div className="member-actions">
        <button className="outline-action">
           <IconEye size={13} stroke={2} />
            View Expenses
        </button>

        <button className="outline-action">
           <IconEdit size={13} stroke={2} />
            Edit Profile
        </button>

        <button
          className="menu-button"
          onClick={() =>
            setActiveMenu(isMenuOpen ? null : member.email)
          }
        >
          <IconDotsVertical size={16} stroke={2} />
        </button>

        {isMenuOpen && (
          <div className="member-menu">
            <button><IconShield size={14} stroke={2} />Manage Access</button>
            <button className="warning"><IconUserOff size={14} stroke={2} /> Deactivate Member</button>
            <button className="danger"><IconTrash size={14} stroke={2} /> Remove Member</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- INVITATION CARD ---------------- */

function InvitationCard({ invite }) {
  return (
    <div className="invitation-card">
      <div className={`invitation-icon ${invite.color}`}>
         <IconMail size={19} stroke={2} />
      </div>

      <div className="invitation-content">
        <div className="invitation-top">
          <div>
            <strong>{invite.name}</strong>
            <span>{invite.email}</span>
          </div>

          <span className={`pending-badge ${invite.color}`}>
            Pending
          </span>
        </div>

        <div className="invitation-bottom">
          <div>
            <span>{invite.sent}</span>
            <small>{invite.expires}</small>
          </div>

          <div className="invitation-actions">
            <button>Resend Invite</button>
            <button className="cancel-button">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeopleAccess;