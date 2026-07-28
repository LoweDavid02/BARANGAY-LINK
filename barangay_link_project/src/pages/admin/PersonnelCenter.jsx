import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  ChevronDown,
  User, 
  Activity, 
  Building,
  Trash2,
  Plus,
  X,
  MoreVertical
} from 'lucide-react';

const PersonnelCenter = () => {
  const { personnel, addPersonnel, removePersonnel } = useTickets();

  // Exact Sitio List
  const sitioList = [
    'Sampaga',
    'JDT Comp',
    'Balite',
    'San Bartolome',
    'Santiago',
    'Pulong Maligaya',
    'Alauli',
    'St. Peter Sub',
    'Bagong Pag-asa Sub',
    'Villena',
    'Pi-Arap',
    'Royal 2',
    'Gonzales Ave',
    'Royal 1',
    'Vincent Ville',
    'McArthur HW'
  ];

  const defaultRoster = personnel.map((p, idx) => ({
    id: 'pers-' + p.id,
    name: p.name,
    role: p.role,
    department: p.department,
    sitio: p.sitio || sitioList[idx % sitioList.length],
    loadRatio: `${p.activeTicketsCount} Active Tickets`,
    activeTickets: p.activeTicketsCount,
    lastActive: 'Active now',
    status: p.status,
    detailedRole: p.role
  }));

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSitioFilter, setSelectedSitioFilter] = useState('All');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [newPersonnel, setNewPersonnel] = useState({ 
    name: '', 
    email: '', 
    role: '', 
    department: 'Administrative Services',
    sitio: 'Sampaga'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPersonnel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addPersonnel(newPersonnel);
      setShowAddModal(false);
      setNewPersonnel({ name: '', email: '', role: '', department: 'Administrative Services', sitio: 'Sampaga' });
    } catch (err) {
      console.error(err);
      alert("Failed to add personnel. Email might already be taken.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [personnelToRemove, setPersonnelToRemove] = useState(null);

  const handleRemoveConfirm = async () => {
    if (!personnelToRemove) return;
    setIsSubmitting(true);
    try {
      await removePersonnel(personnelToRemove.id.replace('pers-', ''));
      setPersonnelToRemove(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
      const sitioMatch = p.sitio.toLowerCase().includes(q);
      if (!nameMatch && !roleMatch && !idMatch && !sitioMatch) return false;
    }

    // 2. Department filter
    if (selectedDept !== 'All') {
      let mappedDept = p.department;
      if (p.department === 'Maintenance') {
        mappedDept = 'Public Works & Infrastructure';
      }
      if (mappedDept !== selectedDept) return false;
    }

    // 3. Sitio filter
    if (selectedSitioFilter !== 'All') {
      if (p.sitio.toLowerCase() !== selectedSitioFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Pagination parameters
  const totalEntries = filteredRoster.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalEntries);
  const currentPersonnel = filteredRoster.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* 1. FILTER CARD WRAPPER */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-slate-200/80 relative overflow-hidden flex flex-col justify-between space-y-6 min-h-[72vh]">
        
        {/* Filter bar row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
          
          {/* Search bar */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-[#0B3A9B] focus-within:bg-white transition-all shadow-2xs w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, role, ID, or sitio..."
              className="w-full bg-transparent border-0 outline-none py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Filters & Add Button */}
          <div className="relative w-full sm:w-auto flex flex-wrap items-center justify-end gap-3">
            
            {/* SELECT SITIO DROPDOWN FILTER */}
            <div className="relative">
              <select
                value={selectedSitioFilter}
                onChange={(e) => {
                  setSelectedSitioFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 focus:border-[#0B3A9B] transition-all shadow-2xs"
              >
                <option value="All">Select Sitio (All)</option>
                {sitioList.map((sitio, idx) => (
                  <option key={idx} value={sitio}>{sitio}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Department Filter Button */}
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Department</span>
            </button>

            {/* Add Personnel Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#0B3A9B] hover:bg-[#082e7a] rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Personnel</span>
            </button>

            {/* Department Dropdown Popover */}
            {showDeptDropdown && (
              <div className="absolute right-0 top-12 z-20 w-80 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-scale-up text-left">
                <div className="flex items-center justify-between px-5 py-4.5 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">Filter by Department</h3>
                  <button 
                    onClick={() => setShowDeptDropdown(false)}
                    className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
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
                          setCurrentPage(1);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all rounded-xl cursor-pointer"
                      >
                        <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'border-[#0B3A9B] bg-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0B3A9B] animate-scale-up" />
                          )}
                        </div>
                        <span className={isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-600 font-bold'}>
                          {dept.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Current Filter Status sub-row */}
        <div className="text-xs text-slate-400 font-bold shrink-0 flex items-center gap-3">
          <span>Department: <strong className="text-slate-700">{selectedDept}</strong></span>
          <span>•</span>
          <span>Sitio: <strong className="text-slate-900 font-bold">{selectedSitioFilter}</strong></span>
        </div>

        {/* Grid Cards Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {currentPersonnel.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-xs text-slate-400 font-bold">
              No personnel found matching the query.
            </div>
          ) : (
            currentPersonnel.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Header section (avatar bubble + name role + 3 DOTS MENU) */}
                <div className="flex items-start justify-between text-left">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full border border-slate-200 relative bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
                      <User className="w-5 h-5" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-slate-400"></div>
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

                  {/* 3 DOTS ACTION MENU IN UPPER RIGHT */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveActionMenu(activeActionMenu === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                      title="Personnel Actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeActionMenu === p.id && (
                      <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg p-1 animate-scale-up text-left">
                        <button
                          onClick={() => {
                            setActiveActionMenu(null);
                            setPersonnelToRemove(p);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Workload indicator (UNIFIED MONOCHROME STYLE) */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>Current Workload</span>
                    <span className="font-extrabold text-slate-800 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                      {p.activeTickets} {p.activeTickets === 1 ? 'Active Ticket' : 'Active Tickets'}
                    </span>
                  </div>
                  
                  {/* Dynamic Workload Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 bg-[#0B3A9B] ${
                        p.activeTickets === 0 ? 'w-0' :
                        p.activeTickets === 1 ? 'w-1/3' :
                        p.activeTickets === 2 ? 'w-2/3' : 'w-full'
                      }`}
                    />
                  </div>
                </div>

                {/* Details list */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs font-semibold text-slate-500 text-left">
                  
                  {/* Last active line */}
                  <div className="flex items-center gap-2 text-slate-600">
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
                    <span className="text-slate-800 font-bold">{p.department}</span>
                  </div>

                  {/* Assigned Sitio Detail */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Assigned Sitio:</span>
                    <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                      {p.sitio}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Role:</span>
                    <span className="text-slate-800 font-bold">{p.detailedRole}</span>
                  </div>

                  {/* Active tickets */}
                  <div className="flex justify-between items-center py-0.5">
                    <span>Active Tickets:</span>
                    <span className="text-slate-800 font-bold">{p.activeTickets}</span>
                  </div>

                </div>

              </div>
            ))
          )}

        </div>

        {/* PAGINATION FOOTER BAR */}
        {filteredRoster.length > 0 && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
            <div>
              Showing <strong className="text-slate-900">{totalEntries === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-slate-900">{endIndex}</strong> of <strong className="text-slate-900">{totalEntries}</strong> personnel
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-slate-700 transition-all shadow-2xs"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#0B3A9B] text-white shadow-2xs font-extrabold' 
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold text-slate-700 transition-all shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ADD PERSONNEL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up text-left">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-base text-slate-900">Add New Personnel</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B3A9B] focus:outline-none transition-all"
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
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B3A9B] focus:outline-none transition-all"
                  placeholder="e.g. juan@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Department</label>
                <select 
                  required
                  value={newPersonnel.department}
                  onChange={(e) => setNewPersonnel({...newPersonnel, department: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B3A9B] focus:outline-none transition-all"
                >
                  <option value="Administrative Services">Administrative Services</option>
                  <option value="Public Works & Infrastructure">Public Works & Infrastructure</option>
                  <option value="Sanitation & Waste Management">Sanitation & Waste Management</option>
                  <option value="Public Safety & Security">Public Safety & Security</option>
                  <option value="Social Welfare & Development">Social Welfare & Development</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Assigned Sitio</label>
                <select 
                  required
                  value={newPersonnel.sitio}
                  onChange={(e) => setNewPersonnel({...newPersonnel, sitio: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B3A9B] focus:outline-none transition-all"
                >
                  {sitioList.map((sitio, idx) => (
                    <option key={idx} value={sitio}>{sitio}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Role / Title</label>
                <input 
                  required
                  type="text" 
                  value={newPersonnel.role}
                  onChange={(e) => setNewPersonnel({...newPersonnel, role: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#0B3A9B] focus:outline-none transition-all"
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
                  className="flex-1 px-4 py-2.5 bg-[#0B3A9B] hover:bg-[#082e7a] text-white font-bold text-sm rounded-xl transition-all cursor-pointer disabled:opacity-70 flex justify-center items-center gap-2"
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

      {/* REMOVE CONFIRMATION MODAL */}
      {personnelToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-up text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                Remove Personnel
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-900">{personnelToRemove.name}</strong> from active personnel? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPersonnelToRemove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PersonnelCenter;
