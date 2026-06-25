"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, LogOut, Video, Star, Archive, ArchiveRestore, ClipboardList, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { mockProfiles } from "@/data/mockProfiles";
import ApplicationsPanel from "@/components/admin/ApplicationsPanel";

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

const AdminPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkingRole, setCheckingRole] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [editingProfile, setEditingProfile] = useState<EditProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adminTab, setAdminTab] = useState<'profiles' | 'apps'>('profiles');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const adGalleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Always require fresh login for admin page
  useEffect(() => {
    let isMounted = true;

    const checkAdminRole = async (userId: string) => {
      if (isMounted) setCheckingRole(true);
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (isMounted) setIsAdmin(!!data);
      } catch {
        if (isMounted) setIsAdmin(false);
      } finally {
        if (isMounted) setCheckingRole(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setIsAuthenticated(!!session?.user);
        if (session?.user) {
          setCheckingRole(true);
          setTimeout(() => checkAdminRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setCheckingRole(false);
        }
      }
    );

    // Sign out first so admin always sees login form — as per user preference
    const initializeAuth = async () => {
      try {
        await supabase.auth.signOut();
        if (isMounted) {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!error && data) setProfiles(data as any as DbProfile[]);
  };

  useEffect(() => {
    if (isAdmin) fetchProfiles();
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: "Redirecting...", variant: "destructive" });
      setAuthLoading(false);
      setTimeout(() => router.push("/"), 1500);
    } else {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const emptyProfile = (): EditProfile => ({
    name: "",
    age: 20,
    height: "5'5\"",
    bodyType: "Slim",
    complexion: "Medium",
    location: "",
    phone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    shortBio: "",
    description: "",
    services: ["Dating", "Companionship"],
    profileImage: "",
    images: [],
    videos: [],
    isAd: false,
    isVerified: false,
    adImages: [],
  });

  const dbToEdit = (p: DbProfile): EditProfile => ({
    id: p.id,
    name: p.name,
    age: p.age || 20,
    height: p.height || "",
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
    isAd: p.is_ad || false,
    isVerified: p.is_verified || false,
    adImages: p.ad_images || [],
  });

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const uploadImage = async (file: File): Promise<string> => {
    return uploadFile(file, "profile-images");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "gallery" | "ad_gallery") => {
    const files = e.target.files;
    if (!files || !editingProfile) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        setEditingProfile((prev) => {
          if (!prev) return prev;
          if (type === "profile") {
            return { ...prev, profileImage: url, images: [url, ...prev.images.filter(i => i !== prev.profileImage)] };
          }
          if (type === "ad_gallery") {
            return { ...prev, adImages: [...prev.adImages, url] };
          }
          return { ...prev, images: [...prev.images, url] };
        });
      }
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProfile) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 100 * 1024 * 1024) {
          toast({ title: "Video too large (max 100MB)", variant: "destructive" });
          continue;
        }
        try {
          const url = await uploadFile(file, "profile-images");
          setEditingProfile((prev) => {
            if (!prev) return prev;
            return { ...prev, videos: [...prev.videos, url] };
          });
          toast({ title: "Video uploaded successfully!" });
        } catch (err: any) {
          console.error("Video upload error:", err);
          toast({ title: "Video upload failed", description: err?.message || "Unknown error", variant: "destructive" });
        }
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      toast({ title: "Video upload failed", description: err?.message || "Unknown error", variant: "destructive" });
    }
    setUploading(false);
    // Reset the input so the same file can be re-selected
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeVideo = (index: number) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      videos: editingProfile.videos.filter((_, i) => i !== index),
    });
  };

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    if (!editingProfile.name || !editingProfile.location) {
      toast({ title: "Name and location are required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const row = {
      name: editingProfile.name,
      age: editingProfile.age,
      height: editingProfile.height,
      body_type: editingProfile.bodyType,
      complexion: editingProfile.complexion,
      location: editingProfile.location,
      phone: editingProfile.phone,
      whatsapp: editingProfile.whatsapp,
      email: editingProfile.email,
      instagram: editingProfile.instagram,
      short_bio: editingProfile.shortBio,
      description: editingProfile.description,
      services: editingProfile.services,
      profile_image: editingProfile.profileImage,
      images: editingProfile.images,
      videos: editingProfile.videos,
      is_ad: editingProfile.isAd,
      is_verified: editingProfile.isVerified,
      ad_images: editingProfile.adImages,
    };
    let error;
    if (editingProfile.id) {
      // @ts-ignore
      ({ error } = await supabase.from("profiles").update(row).eq("id", editingProfile.id));
    } else {
      // @ts-ignore
      ({ error } = await supabase.from("profiles").insert(row));
    }

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved!" });
      setEditingProfile(null);
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    }
    setSaving(false);
  };

  const toggleVip = async (id: string, currentVip: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_pinned: !currentVip }).eq("id", id);
    if (!error) {
      toast({ title: !currentVip ? "Promoted to VIP!" : "Removed from VIP" });
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const toggleArchive = async (id: string, currentArchived: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_archived: !currentArchived } as any).eq("id", id);
    if (!error) {
      toast({ title: !currentArchived ? "Profile hidden from public" : "Profile restored to public" });
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const toggleVerify = async (id: string, currentVerified: boolean) => {
    // @ts-ignore
    const { error } = await supabase.from("profiles").update({ is_verified: !currentVerified }).eq("id", id);
    if (!error) {
      toast({ title: !currentVerified ? "Profile Verified!" : "Verification Removed" });
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const toggleAd = async (id: string, currentAd: boolean) => {
    // @ts-ignore
    const { error } = await supabase.from("profiles").update({ is_ad: !currentAd }).eq("id", id);
    if (!error) {
      toast({ title: !currentAd ? "Promoted to Ads!" : "Removed from Ads" });
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) {
      toast({ title: "Profile deleted" });
      await fetchProfiles();
      queryClient.invalidateQueries({ queryKey: ["all-profiles"] });
    }
  };

  const removeGalleryImage = (index: number) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      images: editingProfile.images.filter((_, i) => i !== index),
    });
  };

  const removeAdImage = (index: number) => {
    if (!editingProfile) return;
    setEditingProfile({
      ...editingProfile,
      adImages: editingProfile.adImages.filter((_, i) => i !== index),
    });
  };

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-pass">Password</Label>
                <Input id="admin-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={authLoading}>Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">You don't have admin privileges.</p>
            <Button variant="outline" onClick={handleLogout}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (editingProfile) {
    return (
      <div className="container mx-auto px-4 py-6 lg:pl-72 max-w-3xl">
        <div className="lg:hidden h-16" />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {editingProfile.id ? "Edit" : "New"} Profile
          </h1>
          <Button variant="outline" onClick={() => setEditingProfile(null)}>Cancel</Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Image</Label>
            {editingProfile.profileImage && (
              <img src={editingProfile.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "profile")} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Photo"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="flex flex-wrap gap-2">
              {editingProfile.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 rounded object-cover" />
                  <button onClick={() => removeGalleryImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} />
            <Button variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Add Gallery Images"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Video className="w-4 h-4" /> Videos</Label>
            <div className="flex flex-wrap gap-2">
              {editingProfile.videos.map((vid, i) => (
                <div key={i} className="relative">
                  <video src={vid} className="w-24 h-16 rounded object-cover" />
                  <button onClick={() => removeVideo(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
            <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
            <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Add Videos"}
            </Button>
            <p className="text-xs text-muted-foreground">Max 100MB per video. MP4, WebM, MOV supported.</p>
          </div>

          <div className="space-y-2 border-t border-dashed border-gray-700 pt-4">
            <Label className="text-pink-400 flex items-center gap-1"><Megaphone className="w-4 h-4" /> Ad Images (for sliding section)</Label>
            <div className="flex flex-wrap gap-2">
              {editingProfile.adImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-16 h-16 rounded object-cover border border-pink-500/30" />
                  <button onClick={() => removeAdImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
                </div>
              ))}
            </div>
            <input ref={adGalleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, "ad_gallery")} />
            <Button variant="outline" size="sm" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10" onClick={() => adGalleryInputRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading..." : "Add Ad Images"}
            </Button>
            <p className="text-[10px] text-muted-foreground">These images will only show in the top sliding banner.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={editingProfile.name} onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={editingProfile.age} onChange={(e) => setEditingProfile({ ...editingProfile, age: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input value={editingProfile.location} onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editingProfile.phone} onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (if different)</Label>
              <Input value={editingProfile.whatsapp} onChange={(e) => setEditingProfile({ ...editingProfile, whatsapp: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input value={editingProfile.height} onChange={(e) => setEditingProfile({ ...editingProfile, height: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Body Type</Label>
              <Select value={editingProfile.bodyType} onValueChange={(v) => setEditingProfile({ ...editingProfile, bodyType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Slim", "Curvy", "Athletic", "Petite", "Thick", "Plus Size"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Complexion</Label>
              <Select value={editingProfile.complexion} onValueChange={(v) => setEditingProfile({ ...editingProfile, complexion: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Light", "Medium", "Dark", "Brown"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editingProfile.email} onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Instagram</Label>
              <Input value={editingProfile.instagram} onChange={(e) => setEditingProfile({ ...editingProfile, instagram: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short Bio</Label>
            <Input value={editingProfile.shortBio} onChange={(e) => setEditingProfile({ ...editingProfile, shortBio: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Full Description</Label>
            <Textarea value={editingProfile.description} onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })} rows={4} />
          </div>

          <div className="space-y-2">
            <Label>Services (comma-separated)</Label>
            <Input value={editingProfile.services.join(", ")} onChange={(e) => setEditingProfile({ ...editingProfile, services: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="isVerified" 
              checked={editingProfile.isVerified} 
              onChange={(e) => setEditingProfile({ ...editingProfile, isVerified: e.target.checked })}
              className="w-4 h-4 accent-green-500"
            />
            <Label htmlFor="isVerified" className="text-green-500 font-bold">Verified Profile</Label>
          </div>

          <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    );
  }

  const activeProfiles = profiles.filter(p => !p.is_archived);
  const archivedProfiles = profiles.filter(p => p.is_archived);
  const displayedProfiles = showArchived ? archivedProfiles : activeProfiles;

  return (
    <div className="container mx-auto px-4 py-6 lg:pl-72">
      <div className="lg:hidden h-16" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button onClick={() => setEditingProfile(emptyProfile())}>
            <Plus className="w-4 h-4 mr-1" /> Add Profile
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main page tabs: Profiles | Applications */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        <button
          onClick={() => setAdminTab('profiles')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            adminTab === 'profiles' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Manage Profiles ({activeProfiles.length})
        </button>
        <button
          onClick={() => setAdminTab('apps')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            adminTab === 'apps' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Applications
        </button>
      </div>

      {/* Applications Panel */}
      {adminTab === 'apps' && <ApplicationsPanel />}

      {/* Profiles Panel */}
      {adminTab === 'profiles' && (
        <>
      <div className="flex gap-2 mb-6">
        <Button
          variant={!showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(false)}
        >
          Active ({activeProfiles.length})
        </Button>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(true)}
          className={showArchived ? "bg-orange-600 hover:bg-orange-700" : "text-orange-400 border-orange-400/50"}
        >
          <Archive className="w-3 h-3 mr-1" /> Archived ({archivedProfiles.length})
        </Button>
      </div>

      {/* DB Profiles */}
      {displayedProfiles.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {displayedProfiles.map((p) => (
            <Card key={p.id} className={p.is_archived ? "border-orange-500/40 opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {p.profile_image ? (
                    <img src={p.profile_image} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{p.name}</p>
                      {p.is_archived && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">Hidden</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{p.age} • {p.location}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.short_bio}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingProfile(dbToEdit(p))}>Edit</Button>
                  <Button 
                    size="sm" 
                    variant={p.is_pinned ? "default" : "outline"} 
                    className={p.is_pinned ? "bg-yellow-500 hover:bg-yellow-600 text-black font-bold" : "text-yellow-500 border-yellow-500/50"} 
                    onClick={() => toggleVip(p.id, !!p.is_pinned)}
                    title="Pin to top"
                  >
                    <Star className={`w-3 h-3 ${p.is_pinned ? "fill-black" : ""}`} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={p.is_verified ? "default" : "outline"} 
                    className={p.is_verified ? "bg-green-600 hover:bg-green-700 text-white font-bold" : "text-green-500 border-green-500/50"} 
                    onClick={() => toggleVerify(p.id, !!p.is_verified)}
                    title="Verify Profile"
                  >
                    <span className="text-[10px]">V</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant={p.is_ad ? "default" : "outline"} 
                    className={p.is_ad ? "bg-pink-500 hover:bg-pink-600 text-white font-bold" : "text-pink-500 border-pink-500/50"} 
                    onClick={() => toggleAd(p.id, !!p.is_ad)}
                    title="Promote to sliding section"
                  >
                    <Megaphone className={`w-3 h-3 ${p.is_ad ? "fill-white" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={p.is_archived ? "text-green-500 border-green-500/50" : "text-orange-400 border-orange-400/50"}
                    onClick={() => toggleArchive(p.id, !!p.is_archived)}
                    title={p.is_archived ? "Restore to public" : "Archive (hide from public)"}
                  >
                    {p.is_archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          {showArchived ? "No archived profiles." : "No active profiles."}
        </p>
      )}

      {/* Static/Mock Profiles */}
      <h2 className="text-lg font-semibold mb-3">Static Profiles ({mockProfiles.length}) <span className="text-xs font-normal text-muted-foreground">— hardcoded, read-only</span></h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockProfiles.map((p) => (
          <Card key={p.id} className="opacity-80 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={p.profileImage} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{p.name}</p>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded shrink-0">Static</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.age} • {p.location}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.shortBio}</p>
              <p className="text-xs text-muted-foreground italic">Edit in src/data/mockProfiles.ts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && mockProfiles.length === 0 && (
        <p className="text-muted-foreground text-center py-12">No profiles yet. Click "Add Profile" to get started.</p>
      )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
