import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function VendorDashboard({ vendorId = "vendor_mama_nkechi" }) {
  const [orders, setOrders] = useState([]);
  const [scannedQr, setScannedQr] = useState("");
  const [verificationMessage, setVerificationMessage] = useState(null);

  // Real-time listener for incoming vendor orders
  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      where("vendor_id", "==", vendorId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    });

    return () => unsubscribe();
  }, [vendorId]);

  // Calculate totals
  const totalVendorEarnings = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + (o.vendor_payout_70 || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  // Verify and redeem student QR ticket
  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    setVerificationMessage(null);

    const matchingOrder = orders.find(
      (o) => o.qr_hash === scannedQr.trim() && o.status === "PENDING"
    );

    if (!matchingOrder) {
      setVerificationMessage({
        type: "error",
        text: "Invalid QR ticket or order already fulfilled!",
      });
      return;
    }

    try {
      const orderRef = doc(db, "orders", matchingOrder.id);
      await updateDoc(orderRef, { status: "COMPLETED" });

      setVerificationMessage({
        type: "success",
        text: `Order Verified! Dispense item(s) for Student ID: ${matchingOrder.student_id}`,
      });
      setScannedQr("");
    } catch (err) {
      setVerificationMessage({
        type: "error",
        text: "Verification failed: " + err.message,
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Portal</h1>
          <p className="text-sm text-gray-500">Campus Food Merchant Dashboard</p>
        </div>
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg font-bold">
          Net Earnings (70%): ₦{totalVendorEarnings.toLocaleString()}
        </div>
      </div>

      {/* Manual or Scanned QR Verification Box */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-lg font-semibold mb-2">Verify Student Ticket</h2>
        <form onSubmit={handleVerifyTicket} className="flex gap-2">
          <input
            type="text"
            placeholder="Scan QR or enter QR Hash string..."
            value={scannedQr}
            onChange={(e) => setScannedQr(e.target.value)}
            className="flex-1 border p-2 rounded-md font-mono text-sm"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
          >
            Verify & Redeem
          </button>
        </form>

        {verificationMessage && (
          <div
            className={`mt-4 p-3 rounded-md text-sm font-medium ${
              verificationMessage.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {verificationMessage.text}
          </div>
        )}
      </div>

      {/* Pending Orders Queue */}
      <div className="bg-white p-6 rounded-xl shadow-md border">
        <h2 className="text-lg font-semibold mb-4">
          Pending Pickup Orders ({pendingOrders.length})
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending orders right now.</p>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-50"
              >
                <div>
                  <p className="font-bold text-sm text-gray-800">Order ID: {order.order_id}</p>
                  <p className="text-xs text-gray-500">QR Code: {order.qr_hash}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">Total Paid: ₦{order.total_amount}</p>
                  <p className="text-xs text-green-600 font-medium">
                    Vendor Cut (70%): ₦{order.vendor_payout_70}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
