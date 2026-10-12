import React from "react";
import { IconPlus } from "@tabler/icons-react";

function TransactionHeader({ onAddTransaction }) {
  return (
    <div className="transactions-header">
      <div>
        <h1>Transactions</h1>
        <p>View, add and manage all your transactions</p>
      </div>

      <button
        type="button"
        className="primary-button transactions-header-add-button"
        onClick={onAddTransaction}
      >
        <IconPlus size={19} />
        Add transaction
      </button>
    </div>
  );
}

export default TransactionHeader;
