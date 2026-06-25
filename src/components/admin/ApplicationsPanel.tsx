"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2, RefreshCw, Phone, MapPin, User } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Application = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  phone: string;
  whatsapp?: string | null;
  short_bio: string | null;
  body_type: string | null;
  complexion: string | null;
  payment_method: string | null;
  payment_phone: string | null;
  transaction_id: string | null;
  status: string;
  plan: string;
  profile_image: string | null;
  images: string[];
  videos: string[];
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment:      { label: "Pending Payment",       color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  pending_verification: { label: "Payment Submitted",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  approved:             { label: "Approved & Live",       color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected:             { label: "Rejected",              color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function ApplicationsPanel() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending_verification" | "pending_payment" | "approved" | "rejected" | "all">("pending_verification");

  const fetchApplications = async () => {
    setLoading(true);
    const query = supabase
      .from("escort_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query.eq("status", filter);

    const { data } = await query;
    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchApplications(); }, [filter]);

  const handleApprove = async (app: Application) => {
    setActionLoading(app.id);
    try {
      // 1. Move to live profiles table
      const { error: insertError } = await supabase.from("profiles").insert({
        name: app.name,
        age: app.age,
        location: app.location,
        phone: app.phone,
        whatsapp: app.whatsapp,
        short_bio: app.short_bio,
        body_type: app.body_type,
        complexion: app.complexion,
        profile_image: app.profile_image,
        images: app.images || [],
        videos: app.videos || [],
        is_archived: true,
        is_pinned: app.plan === "vip",
        rating: 4.5,
      });
      if (insertError) throw insertError;

      // 2. Update application status
      await supabase
        .from("escort_applications")
        .update({ status: "approved" })
        .eq("id", app.id);

      fetchApplications();
    } catch (err) {
      alert("Failed to approve. Check console.");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    await supabase.from("escort_applications").update({ status: "rejected" }).eq("id", id);
    setActionLoading(null);
    fetchApplications();
  };

  const FILTERS = [
    { key: "pending_verification", label: "Needs Verification" },
    { key: "pending_payment",      label: "No Payment Yet" },
    { key: "approved",             label: "Approved" },
    { key: "rejected",             label: "Rejected" },
    { key: "all",                  label: "All" },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Escort Applications</h2>
        <Button variant="ghost" size="sm" onClick={fetchApplications} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filter === f.key
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No applications in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusInfo = STATUS_LABELS[app.status] ?? { label: app.status, color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
            return (
              <div
                key={app.id}
                className="bg-gray-800/60 border border-gray-700 rounded-xl p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    {app.profile_image ? (
                      <img src={app.profile_image} alt={app.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{app.name}</span>
                        {app.age && <span className="text-gray-400 text-sm">· {app.age} yrs</span>}
                        {app.plan === "vip" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-bold tracking-wide">
                            VIP PLAN
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-500/20 text-gray-300 border-gray-500/30">
                            ORDINARY
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-gray-400 text-sm">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {app.location}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {app.phone}</span>
                        {app.body_type && <span>{app.body_type}</span>}
                        {app.complexion && <span>· {app.complexion}</span>}
                        <span className="text-gray-500">· {app.images?.length || 0} pics, {app.videos?.length || 0} vids</span>
                      </div>

                    {app.short_bio && (
                      <p className="text-gray-400 text-xs italic">"{app.short_bio}"</p>
                    )}

                    {/* Payment info */}
                    {app.transaction_id && (
                      <div className="mt-2 p-2.5 bg-blue-900/20 border border-blue-500/20 rounded-lg text-xs space-y-1">
                        <p className="text-blue-300 font-medium">Payment Submitted</p>
                        <p className="text-gray-300">Method: <span className="text-white font-medium uppercase">{app.payment_method}</span></p>
                        <p className="text-gray-300">Phone: <span className="text-white font-medium">{app.payment_phone}</span></p>
                        <p className="text-gray-300">TX ID: <span className="text-white font-mono font-medium">{app.transaction_id}</span></p>
                      </div>
                    )}

                    <p className="text-gray-600 text-xs mt-1">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  </div>

                  {/* Actions */}
                  {app.status === "pending_verification" && (
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 text-xs"
                        onClick={() => handleApprove(app)}
                        disabled={actionLoading === app.id}
                      >
                        {actionLoading === app.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Publish</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/40 text-red-400 hover:bg-red-900/20 h-8 px-3 text-xs"
                        onClick={() => handleReject(app.id)}
                        disabled={actionLoading === app.id}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
