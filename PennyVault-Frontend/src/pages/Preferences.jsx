import React, { useEffect, useState } from "react";
import {
  IconInfoCircle,
  IconCurrencyRupee,
  IconCalendar,
  IconWorld,
  IconSun,
  IconMoon,
  IconLayoutDashboard,
  IconEye,
  IconSparkles,
  IconRefresh,
  IconCircleCheck,
  IconRotateClockwise,
  IconShoppingCart,
  IconBolt,
  IconCar,
  IconDots,
  IconDeviceFloppy,
  IconQuestionMark,
} from "@tabler/icons-react";

import "../Styles/Preferences.css";

const DEFAULT_PREFERENCES = {
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
  language: "English",
  appearance: "Light",
  density: "Comfortable",
};

const currencyOptions = [
  {
    value: "INR",
    label: "Indian Rupee (INR)",
    symbol: "₹",
  },
  {
    value: "USD",
    label: "US Dollar (USD)",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "Euro (EUR)",
    symbol: "€",
  },
  {
    value: "GBP",
    label: "British Pound (GBP)",
    symbol: "£",
  },
  {
    value: "JPY",
    label: "Japanese Yen (JPY)",
    symbol: "¥",
  },
];

const dateFormatOptions = [
  {
    value: "DD/MM/YYYY",
    label: "DD/MM/YYYY (India standard)",
  },
  {
    value: "MM/DD/YYYY",
    label: "MM/DD/YYYY (US standard)",
  },
  {
    value: "YYYY-MM-DD",
    label: "YYYY-MM-DD (ISO standard)",
  },
];

const languageOptions = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
  "Malayalam",
  "Kannada",
];

const previewCategories = [
  {
    name: "Groceries",
    amount: 12500,
    percentage: 32,
    icon: IconShoppingCart,
    type: "green",
  },
  {
    name: "Electricity",
    amount: 3200,
    percentage: 12,
    icon: IconBolt,
    type: "blue",
  },
  {
    name: "Transport",
    amount: 5800,
    percentage: 18,
    icon: IconCar,
    type: "orange",
  },
  {
    name: "Others",
    amount: 8900,
    percentage: 22,
    icon: IconDots,
    type: "purple",
  },
];

function Preferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /*
   * Auto-save simulation.
   * Replace this with your backend API when available.
   */
  useEffect(() => {
    const isDefaultState =
      JSON.stringify(preferences) ===
      JSON.stringify(DEFAULT_PREFERENCES);

    if (isDefaultState) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");

    const timer = setTimeout(() => {
      // Replace with API call:
      // await updatePreferences(preferences);

      setSaveStatus("saved");
    }, 700);

    return () => clearTimeout(timer);
  }, [preferences]);

  const updatePreference = (key, value) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSaveStatus("saving");

    setTimeout(() => {
      // Replace with API call:
      // await updatePreferences(preferences);

      setSaveStatus("saved");
    }, 500);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setShowResetConfirm(false);
    setSaveStatus("saved");
  };

  const selectedCurrency =
    currencyOptions.find(
      (currency) => currency.value === preferences.currency
    ) || currencyOptions[0];

  const formatPreviewAmount = (amount) => {
    if (preferences.currency === "USD") {
      return `$${amount.toLocaleString("en-US")}`;
    }

    if (preferences.currency === "EUR") {
      return `€${amount.toLocaleString("de-DE")}`;
    }

    if (preferences.currency === "GBP") {
      return `£${amount.toLocaleString("en-GB")}`;
    }

    if (preferences.currency === "JPY") {
      return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const previewAmount = formatPreviewAmount(124500);

  return (
    <div className="preferences-page">

      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <header className="preferences-header">

        <div className="preferences-title-area">

          <div className="preferences-title-icon">
            <IconLayoutDashboard
              size={24}
              stroke={1.8}
            />
          </div>

          <div>
            <h1>Preferences</h1>

            <p>
              Customize how SpendNest looks and works for your family.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="learn-more-button"
          onClick={() => {
            alert(
              "Preferences control currency, date format, language, appearance and dashboard display settings."
            );
          }}
        >
          <IconQuestionMark
            size={18}
            stroke={1.8}
          />

          <span>Learn more</span>
        </button>

      </header>


      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <div className="preferences-layout">

        {/* =======================================================
            LEFT SETTINGS
        ======================================================== */}
        <main className="preferences-main">

          {/* =====================================================
              BASIC PREFERENCES
              No "General Preferences" heading
          ====================================================== */}
          <div className="preference-card">

            {/* =================================================
                CURRENCY
            ================================================== */}
            <div className="preference-row">

              <div className="preference-row-info">

                <div className="preference-icon currency-icon">
                  <IconCurrencyRupee
                    size={27}
                    stroke={1.8}
                  />
                </div>

                <div className="preference-description">

                  <div className="preference-label">
                    <h3>Currency</h3>

                    <span
                      className="preference-info"
                      title="Currency controls how monetary amounts are displayed throughout SpendNest."
                    >
                      <IconInfoCircle
                        size={17}
                        stroke={1.8}
                      />
                    </span>
                  </div>

                  <p>
                    Choose the currency used for all amounts.
                  </p>

                </div>

              </div>

              <div className="preference-control">

                <select
                  value={preferences.currency}
                  onChange={(event) =>
                    updatePreference(
                      "currency",
                      event.target.value
                    )
                  }
                  aria-label="Currency"
                >
                  {currencyOptions.map((currency) => (
                    <option
                      key={currency.value}
                      value={currency.value}
                    >
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>

              </div>

            </div>


            {/* =================================================
                DATE FORMAT
            ================================================== */}
            <div className="preference-row">

              <div className="preference-row-info">

                <div className="preference-icon">
                  <IconCalendar
                    size={27}
                    stroke={1.8}
                  />
                </div>

                <div className="preference-description">

                  <div className="preference-label">
                    <h3>Date format</h3>

                    <span
                      className="preference-info"
                      title="Controls how dates are displayed across transactions, reports and bills."
                    >
                      <IconInfoCircle
                        size={17}
                        stroke={1.8}
                      />
                    </span>
                  </div>

                  <p>
                    Choose how dates are displayed in
                    transactions and reports.
                  </p>

                </div>

              </div>

              <div className="preference-control">

                <select
                  value={preferences.dateFormat}
                  onChange={(event) =>
                    updatePreference(
                      "dateFormat",
                      event.target.value
                    )
                  }
                  aria-label="Date format"
                >
                  {dateFormatOptions.map((format) => (
                    <option
                      key={format.value}
                      value={format.value}
                    >
                      {format.label}
                    </option>
                  ))}
                </select>

              </div>

            </div>


            {/* =================================================
                LANGUAGE
            ================================================== */}
            <div className="preference-row">

              <div className="preference-row-info">

                <div className="preference-icon">
                  <IconWorld
                    size={27}
                    stroke={1.8}
                  />
                </div>

                <div className="preference-description">

                  <div className="preference-label">
                    <h3>Language</h3>

                    <span
                      className="preference-info"
                      title="Controls the language used for the SpendNest interface."
                    >
                      <IconInfoCircle
                        size={17}
                        stroke={1.8}
                      />
                    </span>
                  </div>

                  <p>
                    Choose the language for SpendNest interface.
                  </p>

                </div>

              </div>

              <div className="preference-control">

                <select
                  value={preferences.language}
                  onChange={(event) =>
                    updatePreference(
                      "language",
                      event.target.value
                    )
                  }
                  aria-label="Language"
                >
                  {languageOptions.map((language) => (
                    <option
                      key={language}
                      value={language}
                    >
                      {language}
                    </option>
                  ))}
                </select>

              </div>

            </div>

          </div>


          {/* =====================================================
              DISPLAY SETTINGS
              No "Display & Experience" heading
          ====================================================== */}
          <div className="preference-card display-card">

            {/* =================================================
                APPEARANCE
            ================================================== */}
            <div className="preference-row">

              <div className="preference-row-info">

                <div className="preference-icon">
                  {preferences.appearance === "Dark" ? (
                    <IconMoon
                      size={27}
                      stroke={1.8}
                    />
                  ) : (
                    <IconSun
                      size={27}
                      stroke={1.8}
                    />
                  )}
                </div>

                <div className="preference-description">

                  <div className="preference-label">
                    <h3>Appearance</h3>

                    <span
                      className="preference-info"
                      title="Choose whether SpendNest uses light, dark or system appearance."
                    >
                      <IconInfoCircle
                        size={17}
                        stroke={1.8}
                      />
                    </span>
                  </div>

                  <p>
                    Choose light or dark appearance.
                  </p>

                </div>

              </div>

              <div className="segmented-control">

                {["Light", "Dark", "System"].map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      className={
                        preferences.appearance === option
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        updatePreference(
                          "appearance",
                          option
                        )
                      }
                    >
                      {option}
                    </button>
                  )
                )}

              </div>

            </div>


            {/* =================================================
                DASHBOARD DENSITY
            ================================================== */}
            <div className="preference-row">

              <div className="preference-row-info">

                <div className="preference-icon">
                  <IconLayoutDashboard
                    size={27}
                    stroke={1.8}
                  />
                </div>

                <div className="preference-description">

                  <div className="preference-label">
                    <h3>Dashboard density</h3>

                    <span
                      className="preference-info"
                      title="Controls how much information is displayed on the dashboard."
                    >
                      <IconInfoCircle
                        size={17}
                        stroke={1.8}
                      />
                    </span>
                  </div>

                  <p>
                    Choose how much information is displayed
                    on your dashboard.
                  </p>

                </div>

              </div>

              <div className="segmented-control density-control">

                {[
                  "Compact",
                  "Comfortable",
                  "Detailed",
                ].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      preferences.density === option
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      updatePreference(
                        "density",
                        option
                      )
                    }
                  >
                    {option}
                  </button>
                ))}

              </div>

            </div>

          </div>


          {/* =====================================================
              STATUS + ACTIONS
          ====================================================== */}
          <div className="preferences-footer">

            <div
              className={`preferences-save-status ${
                saveStatus === "saving"
                  ? "saving"
                  : "saved"
              }`}
            >

              <div className="preferences-save-status-icon">

                {saveStatus === "saving" ? (
                  <IconRefresh
                    size={17}
                    stroke={1.9}
                    className="status-spin"
                  />
                ) : (
                  <IconCircleCheck
                    size={18}
                    stroke={1.9}
                  />
                )}

              </div>

              <div>

                <div className="preferences-save-status-text">
                  {saveStatus === "saving"
                    ? "Saving your preferences..."
                    : "Your preferences are saved automatically."}
                </div>

                {saveStatus === "saved" && (
                  <div className="preferences-save-status-subtext">
                    Changes are applied across your account.
                  </div>
                )}

              </div>

            </div>


            <div className="preferences-actions">

              <button
                type="button"
                className="preferences-reset-button"
                onClick={() =>
                  setShowResetConfirm(true)
                }
              >
                <IconRotateClockwise
                  size={18}
                  stroke={1.8}
                />

                Reset to defaults
              </button>

              <button
                type="button"
                className="preferences-save-button"
                onClick={handleSave}
              >
                <IconDeviceFloppy
                  size={18}
                  stroke={1.8}
                />

                Save preferences
              </button>

            </div>

          </div>

        </main>


        {/* =======================================================
            RIGHT LIVE PREVIEW
        ======================================================== */}
        <aside className="preferences-preview">

          <div className="preview-card">

            {/* =================================================
                PREVIEW HEADER
            ================================================== */}
            <div className="preview-header">

              <div className="preview-title">

                <div className="preview-title-icon">
                  <IconEye
                    size={21}
                    stroke={1.8}
                  />
                </div>

                <div>

                  <div className="preview-heading-line">

                    <h2>Live Preview</h2>

                    <IconSparkles
                      size={17}
                      stroke={1.8}
                      className="preview-sparkle"
                    />

                  </div>

                  <p>
                    See how your preferences affect
                    SpendNest.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="preview-refresh"
                title="Refresh preview"
              >
                <IconRefresh
                  size={18}
                  stroke={1.8}
                />
              </button>

            </div>


            {/* =================================================
                PURPLE SPENDING CARD
            ================================================== */}
            <div className="preview-spending">

              <span className="preview-spending-label">
                Monthly spending
              </span>

              <button
                type="button"
                className="preview-spending-menu"
                aria-label="Spending options"
              >
                <IconDots
                  size={19}
                  stroke={2}
                />
              </button>

              <strong className="preview-spending-value">
                {previewAmount}
              </strong>

              <span className="preview-spending-period">
                August 2026
              </span>

              <div className="preview-wallet-shape">
                <div className="wallet-line"></div>
                <div className="wallet-dot"></div>
              </div>

            </div>


            {/* =================================================
                CATEGORY LIST
            ================================================== */}
            <div className="preview-categories">

              {previewCategories.map((category) => {
                const CategoryIcon = category.icon;

                return (
                  <div
                    className="preview-category"
                    key={category.name}
                  >

                    <div
                      className={`preview-category-icon ${category.type}`}
                    >
                      <CategoryIcon
                        size={18}
                        stroke={1.8}
                      />
                    </div>

                    <div className="preview-category-info">

                      <span className="preview-category-name">
                        {category.name}
                      </span>

                    </div>

                    <strong className="preview-category-amount">
                      {formatPreviewAmount(
                        category.amount
                      )}
                    </strong>

                    <div className="preview-category-progress">

                      <div className="preview-category-percent">
                        {category.percentage}%
                      </div>

                      <div className="preview-progress-track">

                        <div
                          className={`preview-progress-fill ${category.type}`}
                          style={{
                            width: `${category.percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>


            {/* =================================================
                CURRENT PREFERENCE SUMMARY
            ================================================== */}
            <div className="preview-info-box">

              <div className="preview-info-icon">
                <IconInfoCircle
                  size={19}
                  stroke={1.8}
                />
              </div>

              <div className="preview-info-content">

                <p>
                  Amounts are shown in{" "}
                  <strong>
                    {selectedCurrency.symbol}{" "}
                    ({preferences.currency})
                  </strong>
                </p>

                <p>
                  Dates in{" "}
                  <strong>
                    {preferences.dateFormat}
                  </strong>
                </p>

                <p>
                  Language:{" "}
                  <strong>
                    {preferences.language}
                  </strong>
                </p>

              </div>

            </div>

          </div>

        </aside>

      </div>


      {/* =========================================================
          RESET CONFIRMATION MODAL
      ========================================================== */}
      {showResetConfirm && (
        <div className="reset-modal-overlay">

          <div
            className="reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-preferences-title"
          >

            <div className="reset-modal-icon">
              <IconRotateClockwise
                size={25}
                stroke={1.8}
              />
            </div>

            <h2 id="reset-preferences-title">
              Reset preferences?
            </h2>

            <p>
              Are you sure you want to reset your
              preferences? Your currency, date format,
              language, appearance and dashboard density
              will return to their defaults.
            </p>

            <div className="reset-modal-actions">

              <button
                type="button"
                className="reset-cancel-button"
                onClick={() =>
                  setShowResetConfirm(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="reset-confirm-button"
                onClick={handleReset}
              >
                Reset
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Preferences;