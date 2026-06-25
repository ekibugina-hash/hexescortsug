"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Phone, X } from "lucide-react";
import Image from "next/image";

interface PaymentModalProps {
  applicationId: string;
  planAmount: number;      // e.g. 20000 or 40000
  planName: string;        // e.g. "Ordinary" or "VIP"
  onVerified: () => void;
  onClose: () => void;
}

const PAYMENT_NUMBER = "0765040502";

export default function PaymentModal({ applicationId, planAmount, planName, onVerified, onClose }: PaymentModalProps) {
  const [step, setStep] = useState<"choose" | "instructions" | "verify">("choose");
  const [method, setMethod] = useState<"mtn" | "airtel" | null>(null);
  const [payPhone, setPayPhone] = useState("");
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChoose = (m: "mtn" | "airtel") => {
    setMethod(m);
    setStep("instructions");
  };

  const handleSubmitVerification = async () => {
    setError("");
    if (!payPhone.trim() || !txId.trim()) {
      setError("Please fill in both your phone number and transaction ID.");
      return;
    }
    setLoading(true);
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: dbError } = await supabase
        .from("escort_applications")
        .update({
          payment_method: method,
          payment_phone: payPhone.trim(),
          transaction_id: txId.trim(),
          status: "pending_verification",
        })
        .eq("id", applicationId);
      if (dbError) throw dbError;
      onVerified();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step 1 – Choose Method */}
        {step === "choose" && (
          <div className="text-center">
            <div className="text-4xl mb-3">💳</div>
            <h2 className="text-xl font-bold text-white mb-1">{planName} Plan — Payment</h2>
            <p className="text-gray-400 text-sm mb-1">
              Pay <span className="text-pink-400 font-bold">UGX {planAmount.toLocaleString()}</span> per week to activate your profile.
            </p>
            <p className="text-gray-500 text-xs mb-6">Your profile goes live in 5–10 minutes after confirmation.</p>
            <p className="text-gray-300 text-sm mb-4">Choose your payment method:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleChoose("mtn")}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-yellow-400/40 bg-yellow-400/5 hover:bg-yellow-400/15 hover:border-yellow-400 transition-all overflow-hidden"
              >
                <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-1">
                  <Image 
                    src="/assets/mtn-payment.jpg" 
                    alt="MTN MoMo" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <span className="text-yellow-400 font-bold text-xs uppercase tracking-wider">MTN MoMo</span>
              </button>
              <button
                onClick={() => handleChoose("airtel")}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-red-400/40 bg-red-400/5 hover:bg-red-400/15 hover:border-red-400 transition-all overflow-hidden"
              >
                <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-1">
                  <Image 
                    src="/assets/airtel-payment.jpg" 
                    alt="Airtel Money" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Airtel Money</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 – Instructions */}
        {step === "instructions" && method && (
          <div>
            <div className={`text-center mb-4 p-3 rounded-xl ${method === "mtn" ? "bg-yellow-400/10 border border-yellow-400/30" : "bg-red-400/10 border border-red-400/30"}`}>
              <p className="font-bold text-lg text-white">{method === "mtn" ? "MTN Mobile Money" : "Airtel Money"}</p>
              <p className="text-gray-300 text-sm">{planName} Plan · UGX {planAmount.toLocaleString()} / week</p>
            </div>

            <div className="space-y-3 mb-6 bg-gray-800/60 rounded-xl p-4">
              <p className="text-white font-semibold text-sm">Follow these steps:</p>
              {method === "mtn" ? (
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Dial <span className="text-yellow-400 font-mono">*165#</span> on your MTN line</li>
                  <li>Select <strong>Send Money</strong></li>
                  <li>Send to number: <span className="text-yellow-400 font-bold">{PAYMENT_NUMBER}</span></li>
                  <li>Amount: <span className="text-white font-bold">UGX {planAmount.toLocaleString()}</span></li>
                  <li>Enter your PIN and confirm</li>
                  <li>Copy the <strong>Transaction ID</strong> from your SMS</li>
                </ol>
              ) : (
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Dial <span className="text-red-400 font-mono">*185#</span> on your Airtel line</li>
                  <li>Select <strong>Make Payments</strong></li>
                  <li>Send to number: <span className="text-red-400 font-bold">{PAYMENT_NUMBER}</span></li>
                  <li>Amount: <span className="text-white font-bold">UGX {planAmount.toLocaleString()}</span></li>
                  <li>Enter your PIN and confirm</li>
                  <li>Copy the <strong>Transaction ID</strong> from your SMS</li>
                </ol>
              )}
            </div>

            <Button className="w-full bg-pink-600 hover:bg-pink-700" onClick={() => setStep("verify")}>
              I've Made the Payment →
            </Button>
            <button onClick={() => setStep("choose")} className="w-full mt-2 text-sm text-gray-400 hover:text-white transition-colors">
              ← Go back
            </button>
          </div>
        )}

        {/* Step 3 – Verify */}
        {step === "verify" && (
          <div>
            <div className="text-center mb-5">
              <Phone className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Confirm Your Payment</h2>
              <p className="text-gray-400 text-sm mt-1">Enter the number you used and the transaction ID from your SMS.</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm">Phone Number Used to Pay</Label>
                <Input
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Transaction ID (from SMS)</Label>
                <Input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="e.g. MMT3478QWERTY"
                  className="mt-1 bg-gray-800 border-gray-600 text-white font-mono"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleSubmitVerification}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Submit for Verification
              </Button>
              <button onClick={() => setStep("instructions")} className="w-full mt-1 text-sm text-gray-400 hover:text-white transition-colors">
                ← Back to instructions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
