import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { Check } from 'lucide-react';

const AdminSettings = () => {
  const { currentUser, currentUserType, setCurrentUser } = useTickets();

  // Personal details state initialized dynamically
  const [name, setName] = useState(currentUser?.name || 'Marcus Sterling');
  const [email, setEmail] = useState(currentUser?.email || 'm.sterling@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '(+63) 999 999 9999');
  
  // Role matches the dropdown mock
  const [role, setRole] = useState(
    currentUserType === 'personnel' ? 'Senior Technical Officer' : 'Barangay Admin'
  );

  // Password fields
  const [oldPass, setOldPass] = useState('password123');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  
  // Notification toggle state
  const [emailNotif, setEmailNotif] = useState(true);

  // Save changes visual modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    setCurrentUser(prev => ({
      ...prev,
      name: name,
      email: email,
      phone: phone
    }));
    setShowSuccessModal(true);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setShowSuccessModal(true);
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'VERY WEAK', color: 'bg-rose-500', width: 'w-1/6' };
    if (pass.length < 6) return { label: 'VERY WEAK', color: 'bg-rose-500', width: 'w-1/6' };
    if (pass.length < 10) return { label: 'WEAK', color: 'bg-amber-500', width: 'w-2/6' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) return { label: 'STRONG', color: 'bg-emerald-500', width: 'w-full' };
    return { label: 'MEDIUM', color: 'bg-yellow-500', width: 'w-4/6' };
  };

  const strength = getPasswordStrength(newPass);

  return (
    <div className="space-y-6 text-left relative font-sans">
      
      {/* Changes Saved Successful Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden flex flex-col p-8 items-center text-center animate-scale-up shrink-0 space-y-6">
            
            {/* Check badge */}
            <div className="w-14 h-14 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center text-blue-900 shadow-md">
              <Check className="w-7 h-7 text-[#0B3A9B] stroke-[3px]" />
            </div>

            {/* Message */}
            <h4 className="font-heading font-extrabold text-base text-slate-900">
              Changes saved successfully!
            </h4>

            {/* Done button */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-[#0B3A9B] hover:bg-[#093082] text-xs font-extrabold text-white transition-all shadow-md cursor-pointer"
            >
              Done
            </button>

          </div>
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: AVATAR & ACCOUNT STATUS (1 column) */}
        <div className="space-y-6">
          
          {/* Card 1: Avatar */}
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
              <img 
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160"} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-base text-slate-900 leading-none">
                {name}
              </h3>
              <p className="text-xs text-slate-400 font-semibold pt-1">
                {currentUserType === 'personnel' ? 'Lead Technical Officer' : 'Barangay Admin'}
              </p>
            </div>
          </div>

          {/* Card 2: Account Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 text-xs font-bold">
            <h4 className="text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3 text-left">
              Account Status
            </h4>
            <div className="flex justify-between items-center text-slate-400">
              <span>Member Since</span>
              <span className="text-slate-800 font-black">OCT 2023</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FORMS CONFIGURATION (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Personal Details */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <h4 className="text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3 text-left">
              Personal Details
            </h4>

            <form onSubmit={handleProfileSave} className="space-y-5 text-xs text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Contact Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Role select */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Role</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-750 outline-none focus:border-blue-600 transition-all shadow-sm cursor-pointer"
                  >
                    <option value="Dummy Role">Dummy Role</option>
                    <option value="Senior Technical Officer">Senior Technical Officer</option>
                    <option value="Barangay Admin">Barangay Admin</option>
                  </select>
                </div>

              </div>

              {/* Save changes button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-5 py-2.5 rounded-xl font-extrabold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <h4 className="text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3 text-left">
              Change Password
            </h4>

            <form onSubmit={handlePasswordSave} className="space-y-5 text-xs text-left">
              
              {/* Current Password */}
              <div className="space-y-2">
                <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Current Password</label>
                <input 
                  type="password" 
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* New Password */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">New Password</label>
                  <input 
                    type="password" 
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                    required
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="font-extrabold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-sm"
                    required
                  />
                </div>

              </div>

              {/* Password strength section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <span>Strength</span>
                  <span className="font-black text-slate-600">{strength.label}</span>
                </div>
                {/* Strength bar */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold block pt-1">
                  Use a mix of letters, numbers, and symbols for a stronger password.
                </span>
              </div>

              {/* Update Password button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#0B3A9B] hover:bg-[#093082] text-white px-5 py-2.5 rounded-xl font-extrabold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Update Password
                </button>
              </div>

            </form>
          </div>

          {/* Card 3: Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3 text-left">
              Notification Preferences
            </h4>
            
            <div className="flex items-center justify-between gap-4 text-xs text-left">
              <div className="space-y-1 text-left">
                <h5 className="font-extrabold text-slate-805">Email Notifications</h5>
                <p className="text-[11px] text-slate-450 font-semibold">Receive ticket updates and weekly reports.</p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setEmailNotif(!emailNotif)}
                className={`
                  w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 shrink-0
                  ${emailNotif ? 'bg-[#0B3A9B]' : 'bg-slate-300'}
                `}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${emailNotif ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;
