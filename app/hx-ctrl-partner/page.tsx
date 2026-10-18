"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, Plus, LogOut, Video, Star, Archive, ArchiveRestore, 
  ClipboardList, Megaphone, CheckCircle, XCircle, MapPin, 
  Phone, User, ShieldCheck, RefreshCw, Loader2 
} from "lucide-react";

// MASTER KILL SWITCH: Change to false whenever you want this route to return a 404 Not Found
export const IS_PARTNER_DASH_ENABLED = true;

interface DbProfile {
  id: string;
  name: string;
  age: number | null;
  height: string | null;
  body_type: string | null;
  complexion: string | null;
  location: string;
  phone: string | null;
  whatsapp?: string | null;
  email: string | null;
  instagram: string | null;
  short_bio: string | null;
  description: string | null;
  services: string[];
  profile_image: string | null;
  images: string[];
  videos: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
  is_ad?: boolean;
  is_verified?: boolean;
  ad_images?: string[];
}

interface EditProfile {
  id?: string;
  name: string;
  age: number;
  height: string;
  bodyType: string;
  complexion: string;
  location: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  shortBio: string;
  description: string;
  services: string[];
  profileImage: string;
  images: string[];
  videos: string[];
  isAd?: boolean;
  isVerified?: boolean;
  adImages: string[];
}

interface Application {
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
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment:      { label: "Pending Payment",       color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  pending_verification: { label: "Payment Submitted",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  approved:             { label: "Approved & Live",       color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected:             { label: "Rejected",              color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const FILTERS = [
  { key: "pending_verification", label: "Payment Submitted" },
  { key: "pending_payment",      label: "Pending Payment" },
  { key: "approved",             label: "Approved & Live" },
  { key: "rejected",             label: "Rejected" },
  { key: "all",                  label: "All Applications" },
] as const;

export default function PartnerAdminPage() {
  if (!IS_PARTNER_DASH_ENABLED) {
    notFound();
  }

  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("admin@hexescortsug.com");
  const [password, setPassword] = useState("");

  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [editingProfile, setEditingProfile] = useState<EditProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [adminTab, setAdminTab] = useState<"profiles" | "apps">("profiles");
  const [appFilter, setAppFilter] = useState<"pending_verification" | "pending_payment" | "approved" | "rejected" | "all">("pending_verification");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const res = await fetch("/api/hx-partner-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProfiles(data.profiles);
        setApplications(data.applications);
        setIsAuthenticated(true);
        toast({ title: "Welcome to Hex Admin Panel", description: "Authenticated successfully." });
      } else {
        toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect to admin gateway.", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
    setProfiles([]);
    setApplications([]);
    toast({ title: "Logged out", description: "Session ended." });
  };

  const emptyProfile = (): EditProfile => ({
    name: "",
    age: 21,
    height: "5'6\"",
    bodyType: "Slim",
    complexion: "Medium",
    location: "Kampala",
    phone: "0701 ••• ••99",
    whatsapp: "0701 ••• ••99",
    email: "partner••••@hexescortsug.com",
    instagram: "@••••••••",
    shortBio: "",
    description: "",
    services: ["Companionship"],
    profileImage: "/storage/profile-images/1776367731615-tju7piadu4i.jpg",
    images: [],
    videos: [],
    isAd: false,
    isVerified: true,
    adImages: [],
  });

  const dbToEdit = (p: DbProfile): EditProfile => ({
    id: p.id,
    name: p.name,
    age: p.age || 21,
    height: p.height || "5'6\"",
    bodyType: p.body_type || "Slim",
    complexion: p.complexion || "Medium",
    location: p.location,
    phone: p.phone || "",
    whatsapp: p.whatsapp || "",
    email: p.email || "",
    instagram: p.instagram || "",
    shortBio: p.short_bio || "",
    description: p.description || "",
    services: p.services || [],
    profileImage: p.profile_image || "",
    images: p.images || [],
    videos: p.videos || [],
    isAd: p.is_ad,
    isVerified: p.is_verified,
    adImages: p.ad_images || [],
  });

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));

    if (editingProfile.id) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === editingProfile.id
            ? {
                ...p,
                name: editingProfile.name,
                age: editingProfile.age,
                height: editingProfile.height,
                body_type: editingProfile.bodyType,
                complexion: editingProfile.complexion,
                location: editingProfile.location,
                short_bio: editingProfile.shortBio,
                description: editingProfile.description,
                services: editingProfile.services,
                is_ad: editingProfile.isAd,
                is_verified: editingProfile.isVerified,
              }
            : p
        )
      );
    } else {
      const newP: DbProfile = {
        id: `mock-${Date.now()}`,
        name: editingProfile.name || "New Companion",
        age: editingProfile.age,
        height: editingProfile.height,
        body_type: editingProfile.bodyType,
        complexion: editingProfile.complexion,
        location: editingProfile.location || "Kampala",
        phone: editingProfile.phone || "0701 ••• ••99",
        whatsapp: editingProfile.whatsapp || "0701 ••• ••99",
        email: editingProfile.email || "c•••••@gmail.com",
        instagram: null,
        short_bio: editingProfile.shortBio,
        description: editingProfile.description,
        services: editingProfile.services,
        profile_image: editingProfile.profileImage || "/storage/profile-images/1776367731615-tju7piadu4i.jpg",
        images: editingProfile.images,
        videos: [],
        is_pinned: false,
        is_archived: false,
        is_ad: editingProfile.isAd,
        is_verified: editingProfile.isVerified,
      };
      setProfiles((prev) => [newP, ...prev]);
    }

    toast({ title: "Profile saved successfully!" });
    setSaving(false);
    setEditingProfile(null);
  };

  const toggleVip = (id: string, currentVip: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_pinned: !currentVip } : p))
    );
    toast({ title: !currentVip ? "Promoted to VIP!" : "Removed from VIP" });
  };

  const toggleArchive = (id: string, currentArchived: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_archived: !currentArchived } : p))
    );
    toast({ title: !currentArchived ? "Profile hidden from public" : "Profile restored to public" });
  };

  const toggleVerify = (id: string, currentVerified: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_verified: !currentVerified } : p))
    );
    toast({ title: !currentVerified ? "Profile Verified!" : "Verification Removed" });
  };

  const toggleAd = (id: string, currentAd: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_ad: !currentAd } : p))
    );
    toast({ title: !currentAd ? "Promoted to Ads!" : "Removed from Ads" });
  };

  const handleDelete = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Profile deleted" });
  };

  const handleApproveApp = async (appId: string) => {
    setActionLoading(appId);
    await new Promise((r) => setTimeout(r, 600));
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "approved" } : a))
    );
    setActionLoading(null);
    toast({ title: "Application Approved!", description: "Escort profile has been activated." });
  };

  const handleRejectApp = async (appId: string) => {
    setActionLoading(appId);
    await new Promise((r) => setTimeout(r, 600));
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "rejected" } : a))
    );
    setActionLoading(null);
    toast({ title: "Application Rejected", variant: "destructive" });
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0b] text-white">
        <Card className="w-full max-w-sm bg-gray-900 border-gray-800 text-white shadow-2xl">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <span className="text-pink-500 font-extrabold text-lg tracking-wider">HEX ESCORTS UG</span>
            </div>
            <CardTitle className="text-center text-lg text-white">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-gray-300">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-pass" className="text-gray-300">Password</Label>
                <Input
                  id="admin-pass"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold"
                disabled={authLoading}
              >
                {authLoading ? "Verifying..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. EDIT PROFILE VIEW
  if (editingProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white py-8 px-4">
        <div className="container mx-auto max-w-3xl bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white">
              {editingProfile.id ? "Edit" : "New"} Profile
            </h1>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white" onClick={() => setEditingProfile(null)}>
              Cancel
            </Button>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-300">Profile Image</Label>
              {editingProfile.profileImage && (
                <img src={editingProfile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-pink-500/40" />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Name</Label>
                <Input
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Location</Label>
                <Input
                  value={editingProfile.location}
                  onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Age</Label>
                <Input
                  type="number"
                  value={editingProfile.age}
                  onChange={(e) => setEditingProfile({ ...editingProfile, age: parseInt(e.target.value) || 20 })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Height</Label>
                <Input
                  value={editingProfile.height}
                  onChange={(e) => setEditingProfile({ ...editingProfile, height: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Body Type</Label>
                <Input
                  value={editingProfile.bodyType}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bodyType: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Complexion</Label>
                <Input
                  value={editingProfile.complexion}
                  onChange={(e) => setEditingProfile({ ...editingProfile, complexion: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Contact Phone (Protected)</Label>
                <Input
                  disabled
                  value={editingProfile.phone}
                  className="bg-gray-800/60 border-gray-700 text-gray-400 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">WhatsApp (Protected)</Label>
                <Input
                  disabled
                  value={editingProfile.whatsapp}
                  className="bg-gray-800/60 border-gray-700 text-gray-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Short Bio</Label>
              <Input
                value={editingProfile.shortBio}
                onChange={(e) => setEditingProfile({ ...editingProfile, shortBio: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Full Description</Label>
              <Textarea
                rows={4}
                value={editingProfile.description}
                onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
              <Button variant="outline" className="border-gray-700 text-gray-300" onClick={() => setEditingProfile(null)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN DASHBOARD VIEW
  const activeProfiles = profiles.filter((p) => !p.is_archived);
  const archivedProfiles = profiles.filter((p) => p.is_archived);
  const displayedProfiles = showArchived ? archivedProfiles : activeProfiles;

  const filteredApps =
    appFilter === "all"
      ? applications
      : applications.filter((a) => a.status === appFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Hex Admin Panel
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                Partner View
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Logged in as {email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditingProfile(emptyProfile())}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Profile
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Switcher: Manage Profiles | Applications */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
          <button
            onClick={() => setAdminTab("profiles")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              adminTab === "profiles"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                : "text-gray-400 hover:text-white bg-gray-900 border border-gray-800"
            }`}
          >
            Manage Profiles ({activeProfiles.length})
          </button>
          <button
            onClick={() => setAdminTab("apps")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              adminTab === "apps"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                : "text-gray-400 hover:text-white bg-gray-900 border border-gray-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Applications ({applications.length})
          </button>
        </div>

        {/* PROFILES TAB */}
        {adminTab === "profiles" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {showArchived ? `Archived Profiles (${archivedProfiles.length})` : `Active Profiles (${activeProfiles.length})`}
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:text-white text-xs"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived ? <ArchiveRestore className="w-3.5 h-3.5 mr-1" /> : <Archive className="w-3.5 h-3.5 mr-1" />}
                {showArchived ? "View Active Profiles" : "View Archived Profiles"}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {displayedProfiles.map((p) => (
                <Card
                  key={p.id}
                  className={`bg-gray-900 border-gray-800 text-white hover:border-gray-700 transition-all ${
                    p.is_archived ? "border-orange-500/40 opacity-75" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {p.profile_image ? (
                        <img src={p.profile_image} alt={p.name} className="w-12 h-12 rounded-full object-cover border border-gray-700" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-white truncate">{p.name}</p>
                          {p.is_pinned && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.2 rounded font-bold">VIP</span>}
                          {p.is_verified && <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.2 rounded font-bold">VERIFIED</span>}
                          {p.is_ad && <span className="text-[9px] bg-pink-500/20 text-pink-400 px-1.5 py-0.2 rounded font-bold">SPA AD</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{p.age} yrs • {p.location}</p>
                        <p className="text-[11px] text-pink-400 font-mono mt-0.5">{p.phone}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {p.short_bio || p.description || "Verified independent escort in Uganda."}
                    </p>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-800">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-gray-700 text-gray-200 text-xs h-8"
                        onClick={() => setEditingProfile(dbToEdit(p))}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={p.is_pinned ? "default" : "outline"}
                        className={`h-8 px-2.5 ${p.is_pinned ? "bg-yellow-500 text-black font-bold" : "border-yellow-500/40 text-yellow-500"}`}
                        onClick={() => toggleVip(p.id, !!p.is_pinned)}
                        title="Toggle VIP"
                      >
                        <Star className={`w-3.5 h-3.5 ${p.is_pinned ? "fill-black" : ""}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant={p.is_verified ? "default" : "outline"}
                        className={`h-8 px-2.5 ${p.is_verified ? "bg-green-600 text-white" : "border-green-500/40 text-green-400"}`}
                        onClick={() => toggleVerify(p.id, !!p.is_verified)}
                        title="Toggle Verified"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant={p.is_ad ? "default" : "outline"}
                        className={`h-8 px-2.5 ${p.is_ad ? "bg-purple-600 text-white" : "border-purple-500/40 text-purple-400"}`}
                        onClick={() => toggleAd(p.id, !!p.is_ad)}
                        title="Toggle Spa Ad"
                      >
                        <Megaphone className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-destructive hover:bg-destructive/20"
                        onClick={() => handleDelete(p.id)}
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {adminTab === "apps" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Escort Applications</h2>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setAppFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    appFilter === f.key
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredApps.map((app) => {
                const statusInfo = STATUS_LABELS[app.status] ?? {
                  label: app.status,
                  color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
                };

                return (
                  <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex gap-4 flex-1 min-w-0">
                        {app.profile_image ? (
                          <img src={app.profile_image} alt={app.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <User className="w-8 h-8 text-gray-500" />
                          </div>
                        )}

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-base">{app.name}</span>
                            {app.age && <span className="text-gray-400 text-sm">• {app.age} yrs</span>}
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-pink-500/20 text-pink-400 border-pink-500/30 font-bold">
                              {app.plan}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-4 text-gray-400 text-xs">
                            <span className="flex items-center gap-1 font-mono text-pink-400">
                              <Phone className="h-3 w-3" /> {app.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {app.location}
                            </span>
                          </div>

                          <div className="bg-black/40 rounded-lg p-2.5 text-xs space-y-1 border border-gray-800/80">
                            <div className="flex gap-4 text-gray-300">
                              <span><strong>Payment Method:</strong> {app.payment_method}</span>
                              <span className="font-mono"><strong>Account:</strong> {app.payment_phone}</span>
                            </div>
                            <div className="text-gray-400 font-mono">
                              <strong>Transaction ID:</strong> {app.transaction_id}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col gap-2">
                        {app.status !== "approved" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                            onClick={() => handleApproveApp(app.id)}
                            disabled={actionLoading === app.id}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {app.status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs h-8"
                            onClick={() => handleRejectApp(app.id)}
                            disabled={actionLoading === app.id}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
