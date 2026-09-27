"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, ChevronRight, Crown, Phone, X, Sparkles } from "lucide-react";
import PaymentModal from "@/components/escort-apply/PaymentModal";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Screen = "plan" | "form" | "success";
type Plan = "monthly" | "vip";

const BecomeEscortPage = () => {
  const [screen, setScreen] = useState<Screen>("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("monthly");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipProfileIdentifier, setVipProfileIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    body_type: "",
    complexion: "",
    location: "",
    phone: "",
    whatsapp: "",
    short_bio: "",
    description: "",
    services: "Dating, Companionship",
    profileImage: "",
    images: [] as string[],
    videos: [] as string[],
  });

  const [showForm, setShowForm] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("escort_application_draft");
    if (savedDraft) {
      try {
        const { form: savedForm, plan: savedPlan, showForm: savedShowForm } = JSON.parse(savedDraft);
        if (savedForm) setForm(savedForm);
        if (savedPlan) setSelectedPlan(savedPlan);
        if (savedShowForm) setShowForm(savedShowForm);
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  }, []);

  // Save to localStorage whenever form or plan changes
  useEffect(() => {
    if (screen === "success") return;
    
    const hasContent = form.name || form.phone || form.profileImage || form.images.length > 0;
    if (hasContent) {
      localStorage.setItem("escort_application_draft", JSON.stringify({ 
        form, 
        plan: selectedPlan,
        showForm
      }));
    }
  }, [form, selectedPlan, showForm, screen]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "gallery") => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        setForm((prev) => {
          if (type === "profile") {
            return { ...prev, profileImage: url, images: [url, ...prev.images.filter(i => i !== prev.profileImage)] };
          }
          return { ...prev, images: [...prev.images, url] };
        });
      }
    } catch {
      setError("Upload failed. Try again.");
    }
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 100 * 1024 * 1024) {
          setError("Video too large (max 100MB).");
          continue;
        }
        const url = await uploadFile(file, "profile-images");
        setForm((prev) => ({ ...prev, videos: [...prev.videos, url] }));
      }
    } catch {
      setError("Video upload failed. Try again.");
    }
    setUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleStartFullMonth = () => {
    setSelectedPlan("monthly");
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmitForm = async () => {
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.location) {
      setError("Name, phone number, and location are required.");
      return;
    }
    if (!form.profileImage) {
      setError("Profile image is required.");
      return;
    }
    if (form.phone.trim().length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("escort_applications")
        .insert({
          name: form.name.trim(),
          age: form.age ? parseInt(form.age) : null,
          height: form.height.trim() || null,
          body_type: form.body_type || null,
          complexion: form.complexion || null,
          location: form.location,
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || form.phone.trim(),
          short_bio: form.short_bio.trim() || null,
          description: form.description.trim() || null,
          services: form.services.split(",").map(s => s.trim()).filter(Boolean),
          status: "pending_payment",
          plan: "monthly",
          profile_image: form.profileImage,
          images: form.images,
          videos: form.videos,
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("Database Insert Error:", dbError);
        throw dbError;
      }
      setApplicationId(data.id);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(`Failed to submit: ${err.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Direct VIP Boost for existing profiles
  const handleVipBoostSubmit = async () => {
    if (!vipProfileIdentifier.trim()) {
      setError("Please enter your existing profile name or phone number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("escort_applications")
        .insert({
          name: vipProfileIdentifier.trim(),
          phone: vipProfileIdentifier.trim(),
          location: "Existing Profile",
          status: "pending_payment",
          plan: "vip_boost",
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      setApplicationId(data.id);
      setShowVipModal(false);
      setSelectedPlan("vip");
      setShowPaymentModal(true);
    } catch (err: any) {
      setError("Failed to create boost request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentVerified = () => {
    localStorage.removeItem("escort_application_draft");
    setShowPaymentModal(false);
    setScreen("success");
  };

  const PRICE = selectedPlan === "monthly" ? 30000 : 10000;
  const PLAN_TITLE = selectedPlan === "monthly" ? "Full Month Listing" : "VIP Boost";

  // --- SUCCESS SCREEN ---
  if (screen === "success") {
    return (
      <div className="container mx-auto px-4 py-12 lg:pl-72">
        <div className="lg:hidden h-16" />
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">🎉 Application Submitted!</h1>
          <p className="text-gray-300 mb-2">
            Your payment is being verified. Once confirmed, your profile will go live in{" "}
            <strong className="text-pink-400">5-10 minutes</strong>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            You'll receive a WhatsApp message when your profile is updated.
          </p>
          <Button className="bg-pink-600 hover:bg-pink-700 w-full" onClick={() => (window.location.href = "/")}>
            Go Back to Homepage
          </Button>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-300 font-medium mb-4">Chat with Support on WhatsApp for help</p>
            <a 
              href="https://wa.me/256727240143" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-max mx-auto px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all font-bold"
            >
              <Phone className="h-5 w-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 lg:pl-72">
      <div className="lg:hidden h-16" />

      {/* Payment Modal */}
      {showPaymentModal && applicationId && (
        <PaymentModal
          applicationId={applicationId}
          planAmount={PRICE}
          planName={PLAN_TITLE}
          onVerified={handlePaymentVerified}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* VIP Boost Modal for Existing Profiles */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gray-900 border border-yellow-400/40 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6">
              <Crown className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold text-white">Add a VIP Week</h2>
              <p className="text-gray-400 text-xs mt-1">
                For profiles already listed on Escorts UG. Enter your profile details below to add VIP placement.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-300 text-sm">Your Profile Name or Phone Number *</Label>
                <Input
                  value={vipProfileIdentifier}
                  onChange={(e) => setVipProfileIdentifier(e.target.value)}
                  placeholder="e.g. Sandra or 0771234567"
                  className="mt-1.5 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 text-base"
                onClick={handleVipBoostSubmit}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Proceed to Payment (UGX 10,000)
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Get your profile seen this week</h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            List your profile or boost your existing listing. Pick a plan below and your ad goes live shortly after verification.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: Monthly Plan */}
          <div className="bg-[#171215] border border-[#3A2A31] rounded-[18px] p-6 sm:p-7 flex flex-col justify-between relative">
            <div>
              <div className="text-xs font-semibold text-[#F2367B] mb-1.5">Monthly plan</div>
              <h2 className="text-2xl font-bold text-white mb-3">Full Month</h2>

              <div className="text-4xl font-extrabold text-[#F2367B] mb-4">
                30,000 <span className="text-base font-normal text-gray-400">shs / month</span>
              </div>

              {/* 4-Week Indicator */}
              <div className="flex gap-1.5 mb-5">
                <div className="flex-1 text-center py-2 px-1 rounded-lg bg-[#E8B93D] text-[#1B0510] font-bold text-xs">
                  Week 1
                  <span className="block text-[10px] font-normal">VIP</span>
                </div>
                <div className="flex-1 text-center py-2 px-1 rounded-lg bg-[#F2367B]/30 text-white font-semibold text-xs">
                  Week 2
                  <span className="block text-[10px] text-gray-300 font-normal">Ordinary</span>
                </div>
                <div className="flex-1 text-center py-2 px-1 rounded-lg bg-[#F2367B]/30 text-white font-semibold text-xs">
                  Week 3
                  <span className="block text-[10px] text-gray-300 font-normal">Ordinary</span>
                </div>
                <div className="flex-1 text-center py-2 px-1 rounded-lg bg-[#F2367B]/30 text-white font-semibold text-xs">
                  Week 4
                  <span className="block text-[10px] text-gray-300 font-normal">Ordinary</span>
                </div>
              </div>

              <p className="text-[#B8A5AD] text-sm leading-relaxed mb-4">
                Your first week runs as a VIP listing — top placement and a badge that gets more eyes on your ad. The remaining three weeks continue as a standard ordinary listing, still visible and searchable, just without the VIP boost.
              </p>

              <div className="border-t border-[#3A2A31] pt-4 mb-6 text-xs text-[#B8A5AD]">
                Best for sellers who want a strong launch push, then steady visibility for the rest of the month.
              </div>
            </div>

            <button
              onClick={handleStartFullMonth}
              className="w-full text-center bg-[#F2367B] hover:bg-[#d92b6a] text-[#1B0510] font-bold text-sm py-3.5 px-4 rounded-xl transition-all"
            >
              Start with Full Month
            </button>
          </div>

          {/* Card 2: VIP Boost */}
          <div className="bg-[#171215] border border-[#E8B93D]/30 rounded-[18px] p-6 sm:p-7 flex flex-col justify-between relative">
            <div>
              <div className="text-xs font-semibold text-[#E8B93D] mb-1.5">Weekly add-on</div>
              <h2 className="text-2xl font-bold text-white mb-3">VIP Boost</h2>

              <div className="text-4xl font-extrabold text-[#E8B93D] mb-4">
                10,000 <span className="text-base font-normal text-gray-400">shs / week</span>
              </div>

              <p className="text-[#B8A5AD] text-sm leading-relaxed mb-4">
                Already on the monthly plan? Add VIP placement to any of the ordinary weeks — weeks 2, 3, or 4 — for 10,000 shs each. Pay only for the weeks you want the extra visibility.
              </p>

              <div className="border-t border-[#3A2A31] pt-4 mb-6 text-xs text-[#B8A5AD]">
                Best for sellers who want to time their VIP boost around a sale, restock, or busy weekend.
              </div>
            </div>

            <button
              onClick={() => {
                setError("");
                setVipProfileIdentifier("");
                setShowVipModal(true);
              }}
              className="w-full text-center bg-transparent hover:bg-[#E8B93D]/10 border border-[#E8B93D] text-[#E8B93D] font-bold text-sm py-3.5 px-4 rounded-xl transition-all"
            >
              Add a VIP Week
            </button>
          </div>
        </div>

        {/* Profile Creation Form */}
        {showForm && (
          <div ref={formRef}>
            <Card className="bg-gray-900/90 border-gray-800 text-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">Create Your Profile (Full Month Plan)</h2>
                    <p className="text-xs text-gray-400">Fill in your information to get listed on Escorts UG.</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-xs text-pink-400 hover:text-pink-300 underline"
                  >
                    Close Form
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Image Uploads */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Main Profile Photo *</Label>
                    <div className="flex items-center gap-4">
                      {form.profileImage ? (
                        <img src={form.profileImage} alt="Profile" className="w-20 h-20 rounded-xl object-cover border-2 border-pink-500" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs">
                          No Photo
                        </div>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "profile")} />
                      <Button
                        type="button"
                        variant="outline"
                        className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : form.profileImage ? "Change Main Photo" : "Upload Main Photo"}
                      </Button>
                    </div>
                  </div>

                  {/* Gallery Photos */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Gallery Photos (Optional)</Label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative">
                            <img src={img} className="w-16 h-16 rounded-lg object-cover" />
                            <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                          </div>
                        ))}
                      </div>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e, "gallery")} />
                      <Button type="button" variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()} disabled={uploading}>
                        {uploading ? "Uploading..." : "+ Add Gallery Photos"}
                      </Button>
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="space-y-3">
                    <Label className="text-white font-medium">Short Video Clips (Optional)</Label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {form.videos.map((vid, i) => (
                          <div key={i} className="relative">
                            <video src={vid} className="w-24 h-16 rounded object-cover" />
                            <button onClick={() => setForm(f => ({ ...f, videos: f.videos.filter((_, idx) => idx !== i)}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">x</button>
                          </div>
                        ))}
                      </div>
                      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
                      <Button type="button" className="bg-pink-600 hover:bg-pink-700 text-white" size="sm" onClick={() => videoInputRef.current?.click()} disabled={uploading}>
                        {uploading ? "Uploading..." : "Add Videos"}
                      </Button>
                      <p className="text-xs text-muted-foreground">Max 100MB per video. MP4, WebM, MOV supported.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="col-span-2 space-y-2">
                      <Label>Display Name *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="The name clients will see (e.g. Sandra)"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        min={18}
                        max={60}
                        value={form.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        placeholder="Must be 18+"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                      <Label>Height</Label>
                      <Input
                        value={form.height}
                        onChange={(e) => handleChange("height", e.target.value)}
                        placeholder="e.g. 5'6&quot;"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Input
                        value={form.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        placeholder="e.g. Kampala, Najjera"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="e.g. 0771234567"
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-2">
                      <Label>WhatsApp (if different)</Label>
                      <Input
                        value={form.whatsapp}
                        onChange={(e) => handleChange("whatsapp", e.target.value)}
                        placeholder="Leave blank if same as above"
                      />
                    </div>

                    {/* Body Type */}
                    <div className="space-y-2">
                      <Label>Body Type</Label>
                      <Select value={form.body_type} onValueChange={(v) => handleChange("body_type", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {["Slim", "Athletic", "Curvy", "Thick", "Plus Size"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Complexion */}
                    <div className="space-y-2">
                      <Label>Complexion</Label>
                      <Select value={form.complexion} onValueChange={(v) => handleChange("complexion", v)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {["Light", "Brown", "Dark", "Chocolate", "Caramel"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Short Bio */}
                    <div className="col-span-2 space-y-2">
                      <Label>Short Bio (shown on profile card)</Label>
                      <Input
                        value={form.short_bio}
                        maxLength={100}
                        onChange={(e) => handleChange("short_bio", e.target.value)}
                        placeholder="One sentence about yourself (max 100 chars)"
                      />
                    </div>

                    {/* Description */}
                    <div className="col-span-2 space-y-2">
                      <Label>About You (full description)</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Tell clients more about your personality, availability, etc."
                        rows={4}
                      />
                    </div>

                    {/* Services */}
                    <div className="col-span-2 space-y-2">
                      <Label>Services (comma-separated)</Label>
                      <Input
                        value={form.services}
                        onChange={(e) => handleChange("services", e.target.value)}
                        placeholder="e.g. Dating, Companionship, Massage"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Selected plan summary */}
                  <div className="p-3 rounded-lg border border-pink-500/30 bg-pink-500/10 text-pink-300 text-sm">
                    <strong>Full Month Listing</strong> – UGX 30,000
                    {" · "}Goes live in <strong>5-10 minutes</strong>
                  </div>

                  <Button
                    className="w-full bg-[#F2367B] hover:bg-[#d92b6a] text-black font-bold py-6 text-base"
                    onClick={handleSubmitForm}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                      <>Continue to Payment (UGX 30,000) <ChevronRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                    <p className="text-gray-300 font-medium mb-4">Chat with Support on WhatsApp for help</p>
                    <a 
                      href="https://wa.me/256727240143" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-max mx-auto px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all font-bold"
                    >
                      <Phone className="h-5 w-5" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BecomeEscortPage;