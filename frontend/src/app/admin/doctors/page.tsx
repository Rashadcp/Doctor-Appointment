"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Filter, Download, Mail, Phone, MapPin, Stethoscope, Trash2, RefreshCcw, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";

export default function DoctorManagement() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilterSpecialty, setSelectedFilterSpecialty] = useState("All");
  const [formLoading, setFormLoading] = useState(false);
  const [specializations, setSpecializations] = useState<string[]>([
    "Cardiology", 
    "Neurology", 
    "Orthopedics", 
    "Pediatrics", 
    "Dermatology", 
    "Psychiatry",
    "General Practice"
  ]);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isAddingNewSpecialty, setIsAddingNewSpecialty] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [newSpecialtyInput, setNewSpecialtyInput] = useState("");
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [isSpecialtyManagerOpen, setIsSpecialtyManagerOpen] = useState(false);
  const [editingSpecialtyName, setEditingSpecialtyName] = useState<string | null>(null);

  const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const openAddDrawer = () => {
    setEditingDoctor(null);
    setImagePreview(null);
    setSelectedImage(null);
    setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setIsAddingNewSpecialty(false);
    setIsSpecialtyModalOpen(false);
    setSelectedSpecialty("");
    setNewSpecialtyInput("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (doctor: any) => {
    setEditingDoctor(doctor);
    setImagePreview(doctor.image);
    setSelectedImage(null);
    setSelectedDays(doctor.availability?.days || []);
    setIsAddingNewSpecialty(false);
    setIsSpecialtyModalOpen(false);
    setSelectedSpecialty(doctor.specialization || "");
    setNewSpecialtyInput("");
    setIsDrawerOpen(true);
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedFilterSpecialty && selectedFilterSpecialty !== "All") {
        params.specialization = selectedFilterSpecialty;
      }

      const response = await api.get("/doctors", { params });
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchDoctors();
  }, [debouncedSearch, selectedFilterSpecialty]);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get("/specializations");
      setSpecializations(response.data);
    } catch (error) {
      console.error("Failed to fetch specializations:", error);
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);



  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this specialist record?")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors(doctors.filter(d => d._id !== id));
      toast.success("Specialist record removed.");
    } catch (error) {
      toast.error("Error: Unable to delete record.");
    }
  };

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = editingDoctor?.image || "";
    if (selectedImage) {
      const imgFormData = new FormData();
      imgFormData.append("image", selectedImage);
      try {
        const uploadRes = await api.post("/admin/upload-image", imgFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = uploadRes.data.url;
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.warning("Warning: Image failed to upload. Proceeding without image.");
      }
    }

    const data = {
      name: formData.get("name"),
      specialization: selectedSpecialty,
      experience: Number(formData.get("experience")),
      fee: Number(formData.get("fee")),
      location: formData.get("location"),
      image: imageUrl,
      availability: {
        days: selectedDays,
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        slotDuration: Number(formData.get("slotDuration"))
      }
    };

    try {
      if (editingDoctor) {
        await api.put(`/admin/doctors/${editingDoctor._id}`, data);
        toast.success("Specialist record updated.");
      } else {
        await api.post("/admin/doctors", data);
        toast.success("Specialist registered successfully.");
      }
      
      await fetchDoctors();
      await fetchSpecializations();
      setIsDrawerOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
      setEditingDoctor(null);
    } catch (error) {
      toast.error("Error: Unable to save changes to the registry.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveNewSpecialty = async () => {
    const val = newSpecialtyInput.trim();
    if (!val) return;
    try {
      await api.post("/specializations", { name: val });
      await fetchSpecializations();
      setSelectedSpecialty(val.toUpperCase());
      setIsSpecialtyModalOpen(false);
      setNewSpecialtyInput("");
      toast.success("Specialty added.");
    } catch (error) {
      toast.error("Error: Unable to register new specialty.");
    }
  };

  const handleDeleteSpecialty = async (name: string) => {
    if (!confirm(`Are you sure? This will remove ${name} from the list.`)) return;
    try {
      await api.delete(`/specializations/${name}`);
      await fetchSpecializations();
      if (selectedSpecialty === name) setSelectedSpecialty("");
      toast.success("Specialty removed.");
    } catch (error) {
      toast.error("Error: Could not delete specialty.");
    }
  };

  const handleUpdateSpecialty = async (oldName: string, newName: string) => {
    try {
      await api.put("/specializations", { oldName, newName });
      await fetchSpecializations();
      if (selectedSpecialty === oldName) setSelectedSpecialty(newName.toUpperCase());
      toast.success("Specialty updated.");
    } catch (error) {
      toast.error("Error: Could not update specialty.");
    }
  };

  const filteredDoctors = doctors;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest">Medical Team</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Doctors available: {doctors.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDoctors}
            className="h-12 px-4 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw size={14} className={cn(loading && "animate-spin")} />
          </button>
          <Button 
            onClick={openAddDrawer}
            className="bg-ink-black text-white hover:bg-deep-blue px-6 h-12 uppercase text-[10px] tracking-widest font-bold gap-2"
          >
            <Plus size={16} />
            Add a new doctor
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or ID..."
            className="w-full h-12 bg-slate-50 border-none pl-12 pr-4 text-xs font-medium focus:ring-1 focus:ring-deep-blue outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          value={selectedFilterSpecialty}
          onChange={(e) => setSelectedFilterSpecialty(e.target.value)}
          className="h-12 px-6 border border-slate-200 bg-white flex items-center gap-3 hover:bg-slate-50 transition-colors uppercase font-bold text-[10px] tracking-widest outline-none focus:ring-1 focus:ring-deep-blue"
        >
          <option value="All">Specialty: All</option>
          {specializations.map(spec => (
            <option key={spec} value={spec}>{spec.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">ID</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Doctor</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Specialty</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Experience</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Location</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td colSpan={7} className="p-4"><Skeleton className="h-8" /></td>
                </tr>
              ))
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <tr key={doctor._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-[11px] font-bold text-slate-400">{doctor._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                        {doctor.image ? (
                          <img src={doctor.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Stethoscope size={14} className="text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-black">{doctor.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-bold uppercase text-deep-blue">{doctor.specialization}</td>
                  <td className="p-4 text-[11px]">{doctor.experience} YRS</td>
                  <td className="p-4 text-[10px] text-slate-500 uppercase">{doctor.location}</td>
                  <td className="p-4">
                    <div className="status-label w-fit bg-status-confirmed text-emerald-700 border-emerald-200">
                      ACTIVE
                    </div>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditDrawer(doctor)}
                      className="p-2 hover:bg-slate-50 transition-colors text-slate-300 hover:text-deep-blue"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doctor._id)}
                      className="p-2 hover:bg-red-50 transition-colors text-slate-300 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-400 font-mono text-xs uppercase">No specialist records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Doctor Side Drawer */}
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingDoctor ? "Edit profile" : "Add a new doctor"}
        subtitle={editingDoctor ? `Updating details for ${editingDoctor.name}` : "Invite a new healthcare provider to the clinic"}
        footer={
          <div className="pt-6">
            <Button 
              type="submit" 
              form="doctor-form"
              disabled={formLoading}
              className="w-full h-14 bg-ink-black text-white uppercase text-[10px] tracking-[0.2em] font-bold hover:bg-deep-blue transition-all disabled:opacity-50"
            >
              {formLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SAVING...
                </>
              ) : (
                editingDoctor ? "Save Changes" : "Confirm Registration"
              )}
            </Button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-wider">
              All data is encrypted and stored securely.
            </p>
          </div>
        }
      >
        <form id="doctor-form" className="space-y-6" onSubmit={handleRegister}>
          {/* Image Upload Area */}
          <div className="space-y-3 bg-slate-50 p-6 border border-slate-200">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specialist Portrait</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 border-2 border-slate-300 flex items-center justify-center overflow-hidden bg-white shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Plus size={20} className="mx-auto text-slate-300 mb-1" />
                    <span className="text-[8px] font-bold text-slate-300 uppercase">Empty</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                  id="doctor-image"
                />
                <label 
                  htmlFor="doctor-image"
                  className="h-12 px-6 bg-white border border-slate-900 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                </label>
                <p className="text-[9px] text-slate-400 font-medium uppercase leading-tight tracking-wider">
                  4:5 Portrait preferred. <br />
                  Max size: 5MB (JPG, PNG)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name</label>
            <input name="name" required type="text" defaultValue={editingDoctor?.name} className="input-field w-full" placeholder="DR. JONATHAN DOE" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specialization</label>
                <button 
                  type="button"
                  onClick={() => setIsSpecialtyManagerOpen(true)}
                  className="text-[9px] font-bold text-deep-blue uppercase tracking-tighter hover:underline"
                >
                  Manage List
                </button>
              </div>
              <select 
                name="specialization" 
                required 
                value={selectedSpecialty}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW") {
                    setIsSpecialtyModalOpen(true);
                  } else {
                    setSelectedSpecialty(e.target.value);
                  }
                }}
                className="input-field w-full bg-white text-xs font-bold"
              >
                <option value="" disabled>Select Specialty</option>
                {specializations.sort().map((spec) => (
                  <option key={spec} value={spec}>{spec.toUpperCase()}</option>
                ))}
                <option value="ADD_NEW" className="text-deep-blue font-black">+ Create New Specialty</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Experience (Yrs)</label>
              <input 
                name="experience" 
                required 
                type="number" 
                defaultValue={editingDoctor?.experience} 
                className="input-field w-full" 
                placeholder="10" 
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Consultation Fee ($)</label>
              <input 
                name="fee" 
                required 
                type="number" 
                defaultValue={editingDoctor?.fee || 150} 
                className="input-field w-full" 
                placeholder="150" 
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location / Facility</label>
            <input name="location" required type="text" defaultValue={editingDoctor?.location} className="input-field w-full" placeholder="MAIN CLINICAL CENTER" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Work hours start</label>
              <input name="startTime" required type="time" defaultValue={editingDoctor?.availability?.startTime || "09:00"} className="input-field w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Work hours end</label>
              <input name="endTime" required type="time" defaultValue={editingDoctor?.availability?.endTime || "17:00"} className="input-field w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slot (Min)</label>
              <input 
                name="slotDuration" 
                required 
                type="number" 
                defaultValue={editingDoctor?.availability?.slotDuration || 30} 
                className="input-field w-full" 
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Availability Selection</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <label key={day} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDays([...selectedDays, day]);
                      } else {
                        setSelectedDays(selectedDays.filter(d => d !== day));
                      }
                    }}
                    className="w-4 h-4 border-slate-300 rounded-none focus:ring-deep-blue text-deep-blue"
                  />
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tighter transition-colors",
                    selectedDays.includes(day) ? "text-deep-blue" : "text-slate-400 group-hover:text-ink-black"
                  )}>
                    {day.slice(0, 3)}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </form>
      </SideDrawer>

      {/* New Specialty Modal */}
      {isSpecialtyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setIsSpecialtyModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
          />
          <div
            className="relative w-full max-w-sm bg-white p-8 z-[101] shadow-2xl border border-slate-200 animate-scaleIn"
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-black">New Specialty</h3>
                <p className="text-[10px] text-slate-400 mt-1">Create a new specialization category</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Specialty Name</label>
                <input 
                  autoFocus
                  value={newSpecialtyInput}
                  onChange={(e) => setNewSpecialtyInput(e.target.value)}
                  className="input-field w-full uppercase"
                  placeholder="e.g. DERMATOLOGY"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSaveNewSpecialty}
                  className="flex-1 bg-ink-black text-white h-12 uppercase text-[10px] tracking-widest font-bold"
                >
                  Save Category
                </Button>
                <Button 
                  onClick={() => setIsSpecialtyModalOpen(false)}
                  className="px-6 h-12 border border-slate-200 text-slate-500 uppercase text-[10px] tracking-widest font-bold hover:bg-slate-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Manager Modal */}
      {isSpecialtyManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10%]">
          <div
            onClick={() => setIsSpecialtyManagerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
          />
          <div
            className="relative w-full max-w-md bg-white z-[101] shadow-2xl border border-slate-200 flex flex-col max-h-[80vh] animate-scaleIn"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-black">Clinical Specialties</h3>
                <p className="text-[10px] text-slate-400 mt-1">Manage specialization categories</p>
              </div>
              <button 
                onClick={() => setIsSpecialtyManagerOpen(false)} 
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-ink-black hover:bg-slate-50 transition-colors"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {specializations.map((spec) => (
                <div key={spec} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 group">
                  {editingSpecialtyName === spec ? (
                    <div className="flex gap-2 w-full">
                      <input 
                        autoFocus
                        defaultValue={spec}
                        id={`edit-spec-${spec}`}
                        className="input-field flex-1 h-10 text-xs"
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`edit-spec-${spec}`) as HTMLInputElement;
                          handleUpdateSpecialty(spec, input.value);
                          setEditingSpecialtyName(null);
                        }}
                        className="px-3 bg-emerald-500 text-white text-[10px] font-bold"
                      >
                        SAVE
                      </button>
                      <button 
                        onClick={() => setEditingSpecialtyName(null)}
                        className="px-3 bg-white border border-slate-200 text-[10px] font-bold"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold uppercase text-ink-black">{spec}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingSpecialtyName(spec)}
                          className="p-2 text-slate-400 hover:text-deep-blue"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSpecialty(spec)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
