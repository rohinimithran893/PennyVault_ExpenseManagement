import React, { useState } from "react";
import {
  IconCalendar,
  IconDownload,
  IconChevronDown,
  IconChartLine,
  IconArrowsLeftRight,
  IconChartDonut,
  IconUsers,
  IconBulb,
  IconInfoCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconX,
  IconArrowRight,
  IconWallet,
  IconCash,
  IconPigMoney,
  IconPercentage,
  IconAdjustmentsHorizontal,
  IconRefresh,
} from "@tabler/icons-react";

import "../Styles/ReportPages.css";

const categoryData = [
  {
    name: "Groceries",
    current: 12500,
    previous: 9800,
    change: 27.6,
  },
  {
    name: "Transport",
    current: 5800,
    previous: 6200,
    change: -6.5,
  },
  {
    name: "Dining Out",
    current: 4600,
    previous: 5200,
    change: -11.5,
  },
  {
    name: "Utilities",
    current: 3200,
    previous: 2900,
    change: 10.3,
  },
  {
    name: "Shopping",
    current: 2900,
    previous: 2400,
    change: 20.8,
  },
];

const subcategoryData = [
  {
    name: "Vegetables",
    current: 2800,
    previous: 2100,
    change: 33.3,
  },
  {
    name: "Fruits",
    current: 1900,
    previous: 1600,
    change: 18.8,
  },
  {
    name: "Dairy",
    current: 2400,
    previous: 2000,
    change: 20,
  },
  {
    name: "Meat",
    current: 3200,
    previous: 2700,
    change: 18.5,
  },
  {
    name: "Other",
    current: 2200,
    previous: 1400,
    change: 57.1,
  },
];

const memberData = [
  {
    name: "Rohini",
    current: 45000,
    previous: 38000,
    change: 18.4,
  },
  {
    name: "Varun",
    current: 28500,
    previous: 31000,
    change: -8.1,
  },
  {
    name: "Arjun",
    current: 18000,
    previous: 16000,
    change: 12.5,
  },
  {
    name: "Meera",
    current: 12000,
    previous: 11000,
    change: 9.1,
  },
];

const formatCurrency = (value) =>
  `₹${value.toLocaleString("en-IN")}`;

const Reports = () => {
  const [activePopup, setActivePopup] = useState(null);
  const [period, setPeriod] = useState("This Month");
  const [dateRange, setDateRange] = useState(
    "1 Aug 2026 - 31 Aug 2026"
  );

  const openPopup = (type) => {
    setActivePopup(type);
  };

  const closePopup = () => {
    setActivePopup(null);
  };

  return (
    <div className="reports-page">

      {/* HEADER */}
      <div className="reports-header">
        <div>
          <div className="reports-title-row">
            <h1>Reports</h1>
            <span className="title-sparkle">✦</span>
          </div>

          <p>
            Analyze your spending and financial trends.
          </p>
        </div>

        <div className="reports-header-actions">
          <button className="date-picker">
            <IconCalendar size={18} />
            <span>{dateRange}</span>
            <IconChevronDown size={16} />
          </button>

          <button className="export-button">
            <IconDownload size={18} />
            Export
            <IconChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* PERIOD FILTERS */}
      <div className="period-filters">
        {[
          "This Month",
          "Last Month",
          "Last 3 Months",
          "This Year",
          "Custom Range",
        ].map((item) => (
          <button
            key={item}
            className={
              period === item
                ? "period-button active"
                : "period-button"
            }
            onClick={() => setPeriod(item)}
          >
            <IconCalendar size={15} />
            {item}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      <div className="report-summary-grid">

        <SummaryCard
          icon={<IconWallet />}
          iconClass="purple"
          title="Total Expenses"
          value="₹1,24,500"
          change="12.5%"
          positive={false}
          subtitle="vs Jul 2026"
          onInfo={() => openPopup("expenses")}
        />

        <SummaryCard
          icon={<IconCash />}
          iconClass="green"
          title="Total Income"
          value="₹1,85,000"
          change="8.3%"
          positive={true}
          subtitle="vs Jul 2026"
          onInfo={() => openPopup("income")}
        />

        <SummaryCard
          icon={<IconPigMoney />}
          iconClass="orange"
          title="Net Savings"
          value="₹60,500"
          change="15.4%"
          positive={true}
          subtitle="vs Jul 2026"
          onInfo={() => openPopup("savings")}
        />

        <SummaryCard
          icon={<IconPercentage />}
          iconClass="violet"
          title="Savings Rate"
          value="32.7%"
          change="4.2%"
          positive={true}
          subtitle="vs Jul 2026"
          onInfo={() => openPopup("savingsRate")}
        />

      </div>

      {/* MAIN REPORTS */}
      <div className="reports-main-grid">

        {/* SPENDING TREND */}
        <ReportCard
          className="spending-card"
          icon={<IconChartLine />}
          title="Spending Trend"
          description="Track how your spending changes over time."
          onInfo={() => openPopup("spendingTrend")}
          action={
            <select className="small-select">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          }
        >
          <div className="chart-legend">
            <span>
              <i className="legend-dot current" />
              This Period
            </span>

            <span>
              <i className="legend-dot previous" />
              Last Period
            </span>
          </div>

          <div className="line-chart">
            <div className="chart-y-axis">
              <span>₹20K</span>
              <span>₹15K</span>
              <span>₹10K</span>
              <span>₹5K</span>
              <span>₹0</span>
            </div>

            <div className="chart-area">
              <div className="chart-grid-line line-1" />
              <div className="chart-grid-line line-2" />
              <div className="chart-grid-line line-3" />
              <div className="chart-grid-line line-4" />

              <svg
                viewBox="0 0 700 250"
                preserveAspectRatio="none"
                className="trend-svg"
              >
                <defs>
                  <linearGradient
                    id="trendFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#5b2cff"
                      stopOpacity="0.20"
                    />
                    <stop
                      offset="100%"
                      stopColor="#5b2cff"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 180
                     C40 150 55 165 90 145
                     C120 130 135 155 170 142
                     C205 128 220 125 245 75
                     C270 25 300 95 325 115
                     C355 135 370 110 400 120
                     C430 130 450 100 480 120
                     C515 145 535 155 560 135
                     C590 110 610 65 640 55
                     C665 48 680 38 700 25
                     L700 250
                     L0 250 Z"
                  fill="url(#trendFill)"
                />

                <path
                  d="M0 180
                     C40 150 55 165 90 145
                     C120 130 135 155 170 142
                     C205 128 220 125 245 75
                     C270 25 300 95 325 115
                     C355 135 370 110 400 120
                     C430 130 450 100 480 120
                     C515 145 535 155 560 135
                     C590 110 610 65 640 55
                     C665 48 680 38 700 25"
                  fill="none"
                  stroke="#5727ff"
                  strokeWidth="3"
                />

                <path
                  d="M0 215
                     C40 190 60 180 90 190
                     C125 200 145 180 175 185
                     C205 190 225 165 245 170
                     C275 175 295 210 325 185
                     C355 160 370 190 400 205
                     C430 220 455 180 480 190
                     C510 200 535 205 560 180
                     C590 155 615 170 640 145
                     C665 125 685 140 700 130"
                  fill="none"
                  stroke="#b9aaff"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>

              <div className="chart-x-axis">
                <span>1 Aug</span>
                <span>8 Aug</span>
                <span>15 Aug</span>
                <span>22 Aug</span>
                <span>31 Aug</span>
              </div>
            </div>
          </div>
        </ReportCard>

        {/* INCOME VS EXPENSES */}
        <ReportCard
          icon={<IconArrowsLeftRight />}
          title="Income vs Expenses"
          description="Compare money coming in and going out."
          onInfo={() => openPopup("incomeExpenses")}
          action={
            <select className="small-select">
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
            </select>
          }
        >
          <div className="bar-chart">
            {[
              ["Aug 1-7", 42, 28],
              ["Aug 8-14", 52, 31],
              ["Aug 15-21", 48, 29],
              ["Aug 22-31", 40, 37],
            ].map(([label, income, expense]) => (
              <div className="bar-group" key={label}>
                <div className="bars">
                  <div
                    className="bar income"
                    style={{ height: `${income * 2}px` }}
                  >
                    <span>₹{income}K</span>
                  </div>

                  <div
                    className="bar expense"
                    style={{ height: `${expense * 2}px` }}
                  >
                    <span>₹{expense}K</span>
                  </div>
                </div>

                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="bar-legend">
            <span>
              <i className="income-dot" />
              Income
            </span>

            <span>
              <i className="expense-dot" />
              Expenses
            </span>
          </div>
        </ReportCard>

      </div>

      {/* ANALYSIS CARDS */}
      <div className="analysis-grid">

        {/* CATEGORY */}
        <AnalysisCard
          icon={<IconChartDonut />}
          title="Category Trends"
          description="See which categories changed the most."
          onClick={() => openPopup("category")}
        >
          <div className="mini-analysis-list">
            {categoryData.slice(0, 4).map((item) => (
              <ComparisonRow
                key={item.name}
                name={item.name}
                current={item.current}
                previous={item.previous}
                change={item.change}
              />
            ))}
          </div>

          <button
            className="analysis-link"
            onClick={() => openPopup("category")}
          >
            View category analysis
            <IconArrowRight size={16} />
          </button>
        </AnalysisCard>

        {/* SUBCATEGORY */}
        <AnalysisCard
          icon={<IconAdjustmentsHorizontal />}
          title="Subcategory Expense"
          description="Compare individual subcategories with the previous period."
          onClick={() => openPopup("subcategory")}
        >
          <div className="subcategory-preview">
            <div className="subcat-filter">
              <span>Groceries</span>
              <IconChevronDown size={14} />
            </div>

            <div className="mini-analysis-list">
              {subcategoryData.slice(0, 3).map((item) => (
                <ComparisonRow
                  key={item.name}
                  name={item.name}
                  current={item.current}
                  previous={item.previous}
                  change={item.change}
                />
              ))}
            </div>
          </div>

          <button
            className="analysis-link"
            onClick={() => openPopup("subcategory")}
          >
            View all subcategories
            <IconArrowRight size={16} />
          </button>
        </AnalysisCard>

        {/* MEMBER */}
        <AnalysisCard
          icon={<IconUsers />}
          title="Member Spending"
          description="Compare spending between members."
          onClick={() => openPopup("member")}
        >
          <div className="member-preview">
            {memberData.slice(0, 4).map((member, index) => (
              <div className="reports-member-row" key={member.name}>
                <div className={`reports-member-avatar avatar-${index}`}>
                  {member.name.charAt(0)}
                </div>

                <span className="member-name">
                  {member.name}
                </span>

                <strong>
                  {formatCurrency(member.current)}
                </strong>

                <div className="member-bar">
                  <span
                    style={{
                      width: `${Math.min(
                        (member.current / 50000) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <ChangeValue value={member.change} />
              </div>
            ))}
          </div>

          <button
            className="analysis-link"
            onClick={() => openPopup("member")}
          >
            View member comparison
            <IconArrowRight size={16} />
          </button>
        </AnalysisCard>

      </div>

      {/* INSIGHTS */}
      <div className="insights-section">

        <div className="insights-heading">
          <div>
            <div className="section-title">
              <IconBulb size={21} />
              <h2>Insights</h2>
            </div>

            <p>
              Automatically generated observations from your spending data.
            </p>
          </div>

          <button
            className="view-all-button"
            onClick={() => openPopup("insights")}
          >
            View all
            <IconArrowRight size={16} />
          </button>
        </div>

        <div className="insights-grid">

          <Insight
            type="warning"
            title="Spending increased"
            text="You spent 12.5% more this month than last month."
            onClick={() => openPopup("spendingInsight")}
          />

          <Insight
            type="opportunity"
            title="Groceries is your top category"
            text="You spent ₹12,500 on groceries this month."
            onClick={() => openPopup("categoryInsight")}
          />

          <Insight
            type="positive"
            title="Good news"
            text="Your income increased by 8.3% compared with last month."
            onClick={() => openPopup("incomeInsight")}
          />

        </div>
      </div>

      {/* FOOTER */}
      <div className="reports-footer">
        <span>
          <IconInfoCircle size={15} />
          All amounts are shown in ₹ (INR)
        </span>

        <span className="footer-separator">•</span>

        <span>
          Data updated as of today, 10:30 AM
        </span>

        <button>
          <IconRefresh size={15} />
          Refresh data
        </button>
      </div>

      {/* ANALYSIS POPUP */}
      {activePopup && (
        <AnalysisModal
          type={activePopup}
          onClose={closePopup}
        />
      )}

    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon,
  iconClass,
  title,
  value,
  change,
  positive,
  subtitle,
  onInfo,
}) => {
  return (
    <div className="summary-card">

      <div className={`summary-icon ${iconClass}`}>
        {icon}
      </div>

      <div className="summary-content">
        <div className="summary-title">
          {title}

          <button onClick={onInfo}>
            <IconInfoCircle size={15} />
          </button>
        </div>

        <strong>{value}</strong>

        <div
          className={
            positive
              ? "summary-change positive"
              : "summary-change negative"
          }
        >
          {positive ? (
            <IconTrendingUp size={15} />
          ) : (
            <IconTrendingUp size={15} />
          )}

          {change}

          <span>{subtitle}</span>
        </div>
      </div>

      <div className={`summary-sparkline ${iconClass}`}>
        <svg viewBox="0 0 100 35">
          <path
            d="M0 28 C10 15 18 30 28 18 C40 4 45 24 57 15 C68 5 78 25 88 10 C94 4 98 8 100 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>

    </div>
  );
};


/* =========================================================
   REPORT CARD
========================================================= */

const ReportCard = ({
  icon,
  title,
  description,
  action,
  onInfo,
  children,
  className = "",
}) => {
  return (
    <section className={`report-card ${className}`}>

      <div className="report-card-header">

        <div className="report-card-heading">
          <div className="report-heading-icon">
            {icon}
          </div>

          <div>
            <div className="heading-with-info">
              <h2>{title}</h2>

              <button
                className="info-button"
                onClick={onInfo}
              >
                <IconInfoCircle size={15} />
              </button>
            </div>

            <p>{description}</p>
          </div>
        </div>

        {action}

      </div>

      {children}

    </section>
  );
};


/* =========================================================
   ANALYSIS CARD
========================================================= */

const AnalysisCard = ({
  icon,
  title,
  description,
  children,
}) => {
  return (
    <section className="analysis-card">

      <div className="analysis-card-header">

        <div className="analysis-title-area">
          <div className="analysis-icon">
            {icon}
          </div>

          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        </div>

      </div>

      {children}

    </section>
  );
};


/* =========================================================
   COMPARISON ROW
========================================================= */

const ComparisonRow = ({
  name,
  current,
  previous,
  change,
}) => {
  return (
    <div className="comparison-row">

      <span className="comparison-name">
        {name}
      </span>

      <strong>
        {formatCurrency(current)}
      </strong>

      <span className="previous-value">
        {formatCurrency(previous)}
      </span>

      <ChangeValue value={change} />

    </div>
  );
};


/* =========================================================
   CHANGE VALUE
========================================================= */

const ChangeValue = ({ value }) => {
  const positive = value >= 0;

  return (
    <span
      className={
        positive
          ? "change-value increase"
          : "change-value decrease"
      }
    >
      {positive ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
};


/* =========================================================
   INSIGHT
========================================================= */

const Insight = ({
  type,
  title,
  text,
  onClick,
}) => {
  return (
    <button
      className={`insight-card ${type}`}
      onClick={onClick}
    >
      <div className="insight-icon">
        {type === "warning" && (
          <IconTrendingUp size={21} />
        )}

        {type === "opportunity" && (
          <IconBulb size={21} />
        )}

        {type === "positive" && (
          <IconTrendingDown size={21} />
        )}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <IconArrowRight size={17} />
    </button>
  );
};


/* =========================================================
   ANALYSIS MODAL
========================================================= */

const AnalysisModal = ({
  type,
  onClose,
}) => {

  const titles = {
    expenses: "Total Expenses Analysis",
    income: "Total Income Analysis",
    savings: "Net Savings Analysis",
    savingsRate: "Savings Rate Analysis",
    spendingTrend: "Spending Trend Analysis",
    incomeExpenses: "Income vs Expenses",
    category: "Category Trend Analysis",
    subcategory: "Subcategory Expense Analysis",
    member: "Member Spending Comparison",
    insights: "Spending Insights",
    spendingInsight: "Spending Increase",
    categoryInsight: "Category Insight",
    incomeInsight: "Income Insight",
  };

  const descriptions = {
    expenses:
      "Compare your total expenses with the previous period.",
    income:
      "Understand how your income changed compared with the previous period.",
    savings:
      "Review how much you saved during the selected period.",
    savingsRate:
      "See how efficiently your income is being converted into savings.",
    spendingTrend:
      "Analyze daily, weekly or monthly spending movement.",
    incomeExpenses:
      "Compare income and expenses across the selected periods.",
    category:
      "Compare each spending category with the previous period.",
    subcategory:
      "Drill down into individual subcategories within a category.",
    member:
      "Compare how much each member spent during the selected period.",
    insights:
      "Review automatically generated observations from your data.",
    spendingInsight:
      "Your total spending increased compared with the previous month.",
    categoryInsight:
      "Groceries currently represents your largest spending category.",
    incomeInsight:
      "Your income increased compared with the previous period.",
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="analysis-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <div className="modal-header">

          <div>
            <span className="modal-eyebrow">
              REPORT ANALYSIS
            </span>

            <h2>
              {titles[type] || "Report Analysis"}
            </h2>

            <p>
              {descriptions[type] ||
                "Detailed analysis for the selected report."}
            </p>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <IconX size={20} />
          </button>

        </div>

        <div className="modal-period">
          <span>Period</span>
          <strong>{dateLabel()}</strong>
        </div>

        {type === "subcategory" ? (
          <SubcategoryModal />
        ) : type === "category" ? (
          <CategoryModal />
        ) : type === "member" ? (
          <MemberModal />
        ) : (
          <GenericAnalysis />
        )}

      </div>
    </div>
  );
};


/* =========================================================
   MODAL CONTENT
========================================================= */

const dateLabel = () => {
  return "Aug 2026 vs Jul 2026";
};

const GenericAnalysis = () => {
  return (
    <div className="modal-analysis">

      <div className="analysis-highlight">
        <div>
          <span>Current Period</span>
          <strong>₹1,24,500</strong>
        </div>

        <div className="analysis-divider" />

        <div>
          <span>Previous Period</span>
          <strong>₹1,10,800</strong>
        </div>

        <div className="modal-change positive">
          ▲ 12.4%
        </div>
      </div>

      <div className="modal-chart-placeholder">
        <div className="placeholder-chart-line" />
        <div className="placeholder-chart-line second" />
        <div className="placeholder-chart-line third" />
      </div>

      <div className="modal-summary-grid">

        <div>
          <span>Highest Point</span>
          <strong>₹19,200</strong>
        </div>

        <div>
          <span>Average</span>
          <strong>₹12,450</strong>
        </div>

        <div>
          <span>Lowest Point</span>
          <strong>₹5,200</strong>
        </div>

      </div>

    </div>
  );
};


const CategoryModal = () => {
  return (
    <div className="modal-table">

      <div className="modal-table-head">
        <span>Category</span>
        <span>Aug 2026</span>
        <span>Jul 2026</span>
        <span>Change</span>
      </div>

      {categoryData.map((item) => (
        <div className="modal-table-row" key={item.name}>
          <span>{item.name}</span>
          <strong>{formatCurrency(item.current)}</strong>
          <span>{formatCurrency(item.previous)}</span>
          <ChangeValue value={item.change} />
        </div>
      ))}

    </div>
  );
};


const SubcategoryModal = () => {
  return (
    <div className="modal-subcategory">

      <div className="modal-filter-row">
        <button className="modal-filter active">
          Groceries
        </button>

        <button className="modal-filter">
          Transport
        </button>

        <button className="modal-filter">
          Dining Out
        </button>

        <button className="modal-filter">
          Utilities
        </button>

        <button className="modal-filter">
          Shopping
        </button>
      </div>

      <div className="modal-table">

        <div className="modal-table-head">
          <span>Subcategory</span>
          <span>Aug 2026</span>
          <span>Jul 2026</span>
          <span>Change</span>
        </div>

        {subcategoryData.map((item) => (
          <div
            className="modal-table-row"
            key={item.name}
          >
            <span>{item.name}</span>
            <strong>
              {formatCurrency(item.current)}
            </strong>

            <span>
              {formatCurrency(item.previous)}
            </span>

            <ChangeValue value={item.change} />
          </div>
        ))}

      </div>

    </div>
  );
};


const MemberModal = () => {
  return (
    <div className="modal-table">

      <div className="modal-table-head">
        <span>Member</span>
        <span>Aug 2026</span>
        <span>Jul 2026</span>
        <span>Change</span>
      </div>

      {memberData.map((item) => (
        <div
          className="modal-table-row"
          key={item.name}
        >
          <span>{item.name}</span>

          <strong>
            {formatCurrency(item.current)}
          </strong>

          <span>
            {formatCurrency(item.previous)}
          </span>

          <ChangeValue value={item.change} />
        </div>
      ))}

    </div>
  );
};

export default Reports;