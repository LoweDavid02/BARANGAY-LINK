import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import sanVicenteGeoJSON from '../assets/san_vicente.json';

// Fix Leaflet's default marker icons in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Icon for urgent/high priority tickets (optional enhancement)
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const DashboardMap = ({ tickets }) => {
  // Center map on San Vicente, Apalit, Pampanga approx coordinates
  const defaultCenter = [14.9472, 120.7512]; // Centered more accurately within the bounds
  
  // Bounding box for San Vicente, Apalit [SouthWest, NorthEast]
  const sanVicenteBounds = [
    [14.9404455, 120.7304056],
    [14.9605818, 120.7659459]
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[500px] border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <h4 className="font-heading font-bold text-base text-slate-900">
          Barangay Ticket Heatmap
        </h4>
        <span className="text-xs font-bold text-slate-500">
          Showing {tickets.length} active locations
        </span>
      </div>
      <div className="flex-1 w-full relative z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={15} 
          scrollWheelZoom={false}
          maxBounds={sanVicenteBounds}
          maxBoundsViscosity={1.0}
          minZoom={14}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; Google Maps'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          
          <GeoJSON 
            data={sanVicenteGeoJSON} 
            style={{
              color: '#3b82f6', // Tailwind blue-500
              weight: 3,
              opacity: 0.8,
              fillColor: '#3b82f6',
              fillOpacity: 0.05,
              dashArray: '5, 5'
            }} 
          />
          
          {tickets.map((ticket, idx) => {
            if (!ticket.location || !ticket.location.lat || !ticket.location.lng) return null;
            
            // Determine marker color based on priority
            let markerColor = 'blue';
            if (ticket.priority === 'HIGH' || ticket.priority === 'High Priority') markerColor = 'red';
            if (ticket.priority === 'MEDIUM' || ticket.priority === 'Medium Priority') markerColor = 'gold';

            return (
              <Marker 
                key={ticket.id || idx} 
                position={[ticket.location.lat, ticket.location.lng]}
                icon={createCustomIcon(markerColor)}
              >
                <Popup>
                  <div className="text-left min-w-[200px]">
                    <h5 className="font-extrabold text-slate-900 text-sm mb-1">{ticket.subject}</h5>
                    <p className="text-xs text-slate-600 mb-2">{ticket.location.address}</p>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${markerColor === 'red' ? 'bg-red-100 text-red-700' : markerColor === 'gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-slate-400">{ticket.status}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DashboardMap;
