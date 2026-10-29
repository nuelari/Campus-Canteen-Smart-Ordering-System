import React from "react";
import QRCode from "react-qr-code";

export default function StudentEBill({ order }) {
  if (!order) return null;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 max-w-sm mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Pickup E-Ticket</h2>
      <p className="text-sm text-gray-500 mb-4">Scan this at the vendor counter</p>

      <div className="p-4 bg-gray-50 rounded-lg border">
        <QRCode value={order.qr_hash} size={180} />
      </div>

      <div className="mt-4 text-center w-full">
        <p className="text-xs text-gray-400 font-mono">ID: {order.order_id}</p>
        <p className="text-lg font-semibold text-green-600 mt-1">Total Paid: ₦{order.total_amount}</p>
        <div className="mt-3 text-left text-xs bg-gray-100 p-2 rounded">
          <p>School Cut (30%): ₦{order.school_commission_30}</p>
          <p>Vendor Payout (70%): ₦{order.vendor_payout_70}</p>
        </div>
      </div>
    </div>
  );
}
