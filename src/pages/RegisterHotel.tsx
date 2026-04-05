import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, Upload, X, Check, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AMENITIES, CITIES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STEPS = ["Basic Info", "Location", "Details", "Photos", "Review"];

const PHONE_REGEX = /^(\+977)?[- ]?(98|97|96)\d{8}$/;

interface FormData {
  hotelName: string;
  ownerName: string;
  phone: string;
  email: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  city: string;
  numRooms: string;
  pricePerNight: string;
  amenities: string[];
  images: File[];
  governmentDoc: File | null;
}

const initialForm: FormData = {
  hotelName: "", ownerName: "", phone: "", email: "", description: "",
  latitude: null, longitude: null, address: "", city: "",
  numRooms: "", pricePerNight: "", amenities: [], images: [], governmentDoc: null,
};

const RegisterHotel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.hotelName.trim()) errs.hotelName = "Hotel name is required";
      if (!form.ownerName.trim()) errs.ownerName = "Owner name is required";
      if (!form.phone.trim()) errs.phone = "Phone is required";
      else if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ""))) errs.phone = "Enter valid Nepali phone (98XXXXXXXX)";
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    } else if (step === 1) {
      if (form.latitude === null || form.longitude === null) errs.location = "Pin your hotel location on the map";
      if (!form.address.trim()) errs.address = "Address is required";
      if (!form.city) errs.city = "Select a city";
    } else if (step === 2) {
      if (!form.numRooms || Number(form.numRooms) < 1) errs.numRooms = "Enter number of rooms";
      if (!form.pricePerNight || Number(form.pricePerNight) < 100) errs.pricePerNight = "Price must be at least रु 100";
    } else if (step === 3) {
      if (form.images.length < 3) errs.images = "Upload at least 3 images";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setSubmitting(true);
    try {
      // Create hotel without owner_id (anonymous registration)
      const hotelData = {
        name: form.hotelName,
        description: form.description,
        address: form.address,
        city: form.city,
        latitude: form.latitude,
        longitude: form.longitude,
        price_per_night: Number(form.pricePerNight),
        num_rooms: Number(form.numRooms),
        amenities: form.amenities,
        phone: form.phone,
        email: form.email,
        status: "pending",
        average_rating: 0,
        review_count: 0,
      };

      const { data: hotel, error: hotelError } = await supabase
        .from('hotels')
        .insert([hotelData])
        .select()
        .single();

      if (hotelError) throw hotelError;

      // Upload images if any
      if (hotel && form.images.length > 0) {
        for (let i = 0; i < form.images.length; i++) {
          const file = form.images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${hotel.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('hotel-images')
            .upload(fileName, file);
          
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('hotel-images')
              .getPublicUrl(fileName);
            
            await supabase.from('hotel_images').insert([{
              hotel_id: hotel.id,
              image_url: publicUrl,
              is_primary: i === 0,
            }]);
          }
        }
      }

      toast({ title: "Hotel registered successfully!" });
      setSubmitted(true);
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Map for step 1
  useEffect(() => {
    if (step !== 1 || !mapRef.current) return;
    const map = L.map(mapRef.current).setView([27.7172, 85.324], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    if (form.latitude && form.longitude) {
      markerRef.current = L.marker([form.latitude, form.longitude]).addTo(map);
      map.setView([form.latitude, form.longitude], 15);
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lng]).addTo(map);
      updateField("latitude", lat);
      updateField("longitude", lng);
    });

    return () => { map.remove(); };
  }, [step]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024);
    updateField("images", [...form.images, ...valid].slice(0, 10));
  }, [form.images]);

  const removeImage = (index: number) => {
    updateField("images", form.images.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Hotel Submitted!</h2>
            <p className="text-muted-foreground">
              Your hotel "{form.hotelName}" has been submitted for verification. Our team will review it within 2-3 business days.
            </p>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-foreground">Status: Pending Verification</p>
              <p className="text-muted-foreground mt-1">You'll receive a notification once approved.</p>
            </div>
            <Button onClick={() => navigate("/")} className="w-full mt-4">Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <h1 className="font-semibold text-foreground">Register Your Hotel</h1>
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="text-xs text-muted-foreground hidden md:inline">{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 md:w-16 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step]}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label>Hotel Name *</Label>
                  <Input value={form.hotelName} onChange={(e) => updateField("hotelName", e.target.value)} placeholder="e.g. Hotel Yak & Yeti" />
                  {errors.hotelName && <p className="text-sm text-destructive">{errors.hotelName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Owner Name *</Label>
                  <Input value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} placeholder="Full name" />
                  {errors.ownerName && <p className="text-sm text-destructive">{errors.ownerName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Contact Number *</Label>
                  <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="98XXXXXXXX" />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="hotel@example.com" />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Tell travelers about your hotel..." rows={4} />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Pin your hotel location on the map *</Label>
                  <div ref={mapRef} className="h-64 rounded-lg border" />
                  {form.latitude && form.longitude && (
                    <p className="text-xs text-muted-foreground">
                      📍 {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
                    </p>
                  )}
                  {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Full Address *</Label>
                  <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Street, Ward, Area" />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Select value={form.city} onValueChange={(v) => updateField("city", v)}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Rooms *</Label>
                    <Input type="number" min="1" value={form.numRooms} onChange={(e) => updateField("numRooms", e.target.value)} />
                    {errors.numRooms && <p className="text-sm text-destructive">{errors.numRooms}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Price per Night (NPR) *</Label>
                    <Input type="number" min="100" value={form.pricePerNight} onChange={(e) => updateField("pricePerNight", e.target.value)} />
                    {errors.pricePerNight && <p className="text-sm text-destructive">{errors.pricePerNight}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={form.amenities.includes(amenity)}
                          onCheckedChange={(checked) =>
                            updateField("amenities", checked
                              ? [...form.amenities, amenity]
                              : form.amenities.filter((a) => a !== amenity)
                            )
                          }
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Hotel Photos (min 3, max 10) *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-video rounded-lg overflow-hidden border">
                        <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                        <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-foreground/70 rounded-full p-0.5">
                          <X className="h-3 w-3 text-background" />
                        </button>
                      </div>
                    ))}
                    {form.images.length < 10 && (
                      <label className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Upload</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  {errors.images && <p className="text-sm text-destructive">{errors.images}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Government Registration Document</Label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild><span><Upload className="h-4 w-4 mr-1" /> Upload Document</span></Button>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => updateField("governmentDoc", e.target.files?.[0] || null)} />
                    </label>
                    {form.governmentDoc && <span className="text-sm text-muted-foreground">{form.governmentDoc.name}</span>}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Please review your submission before submitting.</p>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Hotel Name</span><span className="font-medium text-foreground">{form.hotelName}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Owner</span><span className="font-medium text-foreground">{form.ownerName}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Phone</span><span className="font-medium text-foreground">{form.phone}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">City</span><span className="font-medium text-foreground">{form.city}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Address</span><span className="font-medium text-foreground">{form.address}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Rooms</span><span className="font-medium text-foreground">{form.numRooms}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Price/Night</span><span className="font-medium text-foreground">रु {Number(form.pricePerNight).toLocaleString()}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Amenities</span><span className="font-medium text-foreground">{form.amenities.join(", ") || "None"}</span></div>
                  <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Photos</span><span className="font-medium text-foreground">{form.images.length} uploaded</span></div>
                  <div className="flex justify-between py-2"><span className="text-muted-foreground">Gov. Doc</span><span className="font-medium text-foreground">{form.governmentDoc ? "Uploaded" : "Not uploaded"}</span></div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prev} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                onClick={handleSubmit} 
                className="bg-success hover:bg-success/90 text-success-foreground"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit for Verification"}
              </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterHotel;
