import { db } from "../firebase";
import { doc, runTransaction, collection, serverTimestamp } from "firebase/firestore";

export async function processOrderWithWallet(studentId, vendorId, cartItems, totalAmount) {
  try {
    await runTransaction(db, async (transaction) => {
      const studentRef = doc(db, "users", studentId);
      const studentSnap = await transaction.get(studentRef);

      if (!studentSnap.exists()) throw new Error("Student account not found.");

      const currentBalance = studentSnap.data().wallet_balance || 0;
      if (currentBalance < totalAmount) {
        throw new Error("Insufficient wallet balance. Please recharge!");
      }

      // 30% School Cut / 70% Vendor Payout
      const schoolCommission = totalAmount * 0.30;
      const vendorPayout = totalAmount * 0.70;

      // Deduct from student
      transaction.update(studentRef, { wallet_balance: currentBalance - totalAmount });

      // Update Vendor earnings
      const vendorRef = doc(db, "vendors", vendorId);
      const vendorSnap = await transaction.get(vendorRef);
      const currentVendorEarnings = vendorSnap.exists() ? (vendorSnap.data().total_earnings || 0) : 0;
      transaction.update(vendorRef, { total_earnings: currentVendorEarnings + vendorPayout });

      // Update School Admin account
      const schoolRef = doc(db, "school_finance", "main_account");
      const schoolSnap = await transaction.get(schoolRef);
      const currentSchoolRevenue = schoolSnap.exists() ? (schoolSnap.data().total_revenue_collected || 0) : 0;
      transaction.update(schoolRef, { total_revenue_collected: currentSchoolRevenue + schoolCommission });

      // Generate Order Record with QR Hash
      const newOrderRef = doc(collection(db, "orders"));
      const qrHash = `QR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      transaction.set(newOrderRef, {
        order_id: newOrderRef.id,
        student_id: studentId,
        vendor_id: vendorId,
        items: cartItems,
        total_amount: totalAmount,
        school_commission_30: schoolCommission,
        vendor_payout_70: vendorPayout,
        qr_hash: qrHash,
        status: "PENDING",
        created_at: serverTimestamp(),
      });
    });

    alert("Order successful! Wallet debited and 30% commission recorded.");
  } catch (error) {
    alert("Checkout failed: " + error.message);
  }
}
