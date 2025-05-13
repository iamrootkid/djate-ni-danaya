
import React from "react";

interface InvoiceAmountProps {
  originalAmount?: number;
  newAmount?: number;
  isModified: boolean;
}

export const InvoiceAmount = ({ originalAmount, newAmount, isModified }: InvoiceAmountProps) => {
  // Check if originalAmount is defined, otherwise use 0
  const amount = originalAmount ?? 0;
  
  return (
    <div className="flex flex-col items-end">
      <span className={isModified ? "line-through text-gray-500" : ""}>
        {amount.toLocaleString()} F CFA
      </span>
      {isModified && newAmount !== undefined && (
        <span className="font-medium text-green-600">
          {newAmount.toLocaleString()} F CFA
        </span>
      )}
    </div>
  );
};
