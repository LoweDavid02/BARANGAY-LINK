import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  User, 
  Activity, 
  Mail, 
  Phone, 
  Sparkles,
  Building,
  CheckCircle2,
  Trash2,
  Plus,
  X
} from 'lucide-react';

const PersonnelCenter = () => {
  const { personnel, addPersonnel, removePersonnel } = useTickets();

  const defaultRoster = personnel.map(p => ({
    id: 'pers-' + p.id,
    name: p.name,
    role: p.role,
    department: p.department,
    loadRatio: `${p.activeTicketsCount}/3`,
    activeTickets: p.activeTicketsCount,
    lastActive: 'Active now',
    status: p.status,
    detailedRole: p.role
  }));

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({ name: '', email: '', role: '', department: 'Administrative Services' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPersonnel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addPersonnel(newPersonnel);
      setShowAddModal(false);
      setNewPersonnel({ name: '', email: '', role: '', department: 'Administrative Services' });
    } catch (err) {
      console.error(err);
      alert("Failed to add personnel. Email might already be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this personnel?")) {
      await removePersonnel(id.replace('pers-', ''));
    }
  };

  // Filter Logic
  const filteredRoster = defaultRoster.filter(p => {
    // 1. Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const roleMatch = p.role.toLowerCase().includes(q);
      const idMatch = p.id.toLowerCase().includes(q);
      if (!nameMatch && !roleMatch && !idMatch) return false;
    }
    // 2. Department filter
    if (selectedDept !== 'All') {
      let mappedDept = p.department;
      if (p.department === 'Maintenance') {
        mappedDept = 'Public Works & Infrastructure';
      }
      if (mappedDept !== selectedDept) return false;
    }
    return true;
  });

  const getStatusDotColor = (status) => {
    if (status === 'Available') return 'bg-emerald-500';
    if (status === 'Busy') return 'bg-amber-400';
    return 'bg-slate-400'; // offline/grey
  };

  const getLoadBarColor = (load) => {
    const active = parseInt(load.split('/')[0] || '0', 10);
    if (active >= 3) return 'bg-rose-500';
    if (active === 2) return 'bg-amber-500';
    if (active === 1) return 'bg-blue-600';
    return 'bg-blue-100'; // 0/3
  };

  const getLoadWidth = (load) => {
    const active = parseInt(load.split('/')[0] || '0', 10);
    if (active >= 3) return 'w-full';
    if (active === 2) return 'w-2/3';
    if (active === 1) return 'w-1/3';
    return 'w-0';
  };

  const getLoadTextColor = (load) => {
    const active = parseInt(load.split('/')[0] || '0', 10);
    if (active >= 3) return 'text-rose-600';
    if (active === 2) return 'text-amber-600';
    if (active === 1) return 'text-blue-600';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* 1. FILTER CARD WRAPPER */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden pb-12 flex flex-col justify-between min-h-[72vh]">
        
        {/* Filter bar row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          
          {/* Search bar */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-600 focus-within:bg-white transition-all shadow-sm w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, or ID..."
              className="w-full bg-transparent border-0 outline-none py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Department Filter Dropdown & Add Button */}
          <div className="relative w-full sm:w-auto flex justify-end gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm border border-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Personnel
            </button>
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              Department
            </button>

            {showDeptDropdown && (
              <div className="absolute right-0 top-12 z-20 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden animate-scale-up text-left">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">Filter by Department</h3>
                  <button 
                    onClick={() => setShowDeptDropdown(false)}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* List of departments */}
                <div className="py-3 px-2 space-y-1">
                  {[
                    { id: 'All', label: 'All Departments' },
                    { id: 'Public Works & Infrastructure', label: 'Public Works & Infrastructure' },
                    { id: 'Sanitation & Waste Management', label: 'Sanitation & Waste Management' },
                    { id: 'Public Safety & Security', label: 'Public Safety & Security' },
                    { id: 'Social Welfare & Development', label: 'Social Welfare & Development' },
                    { id: 'Administrative Services', label: 'Administrative Services' }
                  ].map((dept) => {
                    const isSelected = selectedDept === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => {
                          setSelectedDept(dept.id);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all rounded-xl cursor-pointer"
                      >
                        {/* Custom Radio Button */}
                        <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-scale-up" />
                          )}
                        </div>
                        <span className={isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-600 font-bold'}>
                          {dept.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Bottom Separator Line & Padding */}
                <div className="border-t border-slate-100 mt-2 h-14 bg-white" />
              </div>
            )}
          </div>

        </div>

        {/* Current Department Status sub-row */}
        <div className="py-2.5 text-xs text-slate-400 font-bold shrink-0">
          Current Department: <span className="text-slate-700 font-extrabold">{selectedDept}</span>
        </div>

        {/* Grid Cards Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 relative pr-6">
          
        {filteredRoster.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-xs text-slate-400 font-bold">
              No personnel found matching the query.
            </div>
          ) : (
            filteredRoster.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-600/30 transition-all flex flex-col justify-between"
              >
                {/* Header section (avatar bubble + name role) */}
                <div className="flex items-center gap-4 text-left">
                  
                  {/* Circle Avatar placeholder with status dot */}
                  <div className="w-14 h-14 rounded-full border border-slate-200 relative bg-slate-50 flex items-center justify-center shrink-0 text-slate-400">
                    <User className="w-6 h-6" />
                    {/* Colored Status Dot */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusDotColor(p.status)}`}></div>
                  </div>

                  <div className="space-y-0.5 text-left">
                    <h4 className="font-heading font-extrabold text-sm text-slate-900 leading-tight">
                      {p.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {p.role}
                    </span>
                  </div>

                </div>

                {/* Current Load indicator */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-550">
                    <span>Current Load</span>
                    <span className={`font-extrabold ${getLoadTextColor(p.loadRatio)}`}>
                      {p.loadRatio}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getLoadBarColor(p.loadRatio)} ${getLoadWidth(p.loadRatio)}`}></div>
                  </div>
                </div>

                {/* Details list */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs font-semibold text-slate-500 text-left">
                  
                  {/* Last active line */}
                  <div className="flex items-center gap-2 text-slate-650">
                    <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Last active: {p.lastActive}</span>
                  </div>

                  {/* ID */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>ID:</span>
                    <span className="text-slate-800 font-extrabold">{p.id}</span>
                  </div>

                  {/* Department */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Department:</span>
                    <span className="text-slate-850 font-bold">{p.department}</span>
                  </div>

                  {/* Role */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Role:</span>
                    <span className="text-slate-850 font-bold">{p.detailedRole}</span>
                  </div>

                  {/* Active tickets */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Active Tickets:</span>
                    <span className="text-slate-850 font-bold">{p.activeTickets}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-400 font-bold">Actions:</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRemove(p.id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            ))
          )}

        </div>

        {/* Footer Lavender Strip Overlay */}
        <div className="bg-[#ECECF4] h-8 w-full absolute bottom-0 left-0 shrink-0"></div>

      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800">Add New Personnel</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPersonnel} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel({...newPersonnel, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none transition-all"
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address (Used for Google Login)</label>
                <input 
                  required
                  type="email" 
                  value={newPersonnel.email}
                  onChange={(e) => setNewPersonnel({...newPersonnel, email: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none transition-all"
                  placeholder="e.g. juan@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Department</label>
                <select 
                  required
                  value={newPersonnel.department}
                  onChange={(e) => setNewPersonnel({...newPersonnel, department: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none transition-all"
                >
                  <option value="Administrative Services">Administrative Services</option>
                  <option value="Public Works & Infrastructure">Public Works & Infrastructure</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Public Safety & Security">Public Safety & Security</option>
                  <option value="Social Welfare & Development">Social Welfare & Development</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Role / Title</label>
                <input 
                  required
                  type="text" 
                  value={newPersonnel.role}
                  onChange={(e) => setNewPersonnel({...newPersonnel, role: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-600 focus:outline-none transition-all"
                  placeholder="e.g. Public Safety Officer"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Add Personnel'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PersonnelCenter;
