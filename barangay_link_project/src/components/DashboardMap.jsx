import React from 'react';
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

// Custom Icon for priority tickets
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

const DashboardMap = ({ tickets = [] }) => {
  // Centered precisely on San Vicente, Apalit, Pampanga
  const defaultCenter = [14.9472, 120.7512];
  
  // Bounding box for San Vicente, Apalit [SouthWest, NorthEast]
  const sanVicenteBounds = [
    [14.9354455, 120.7254056],
    [14.9655818, 120.7709459]
  ];

  return (
    <div className="w-full relative z-0 rounded-2xl overflow-hidden shadow-inner border border-slate-800" style={{ height: 380 }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={16} 
        scrollWheelZoom={true}
        maxBounds={sanVicenteBounds}
        maxBoundsViscosity={0.8}
        minZoom={14}
        maxZoom={19}
        style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: '#090D16' }}
      >
        {/* CARTO DB DARK MATTER HIGH-DETAIL TILE LAYER (ROADS, STREETS, LANDMARKS) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          maxNativeZoom={19}
          subdomains="abcd"
        />
        
        {/* Crisp Cyan Municipal Boundary Overlay */}
        <GeoJSON 
          data={sanVicenteGeoJSON} 
          style={{
            color: '#38BDF8', // Tailwind sky-400
            weight: 2.5,
            opacity: 0.95,
            fillColor: '#0284C7',
            fillOpacity: 0.12,
            dashArray: '5, 5'
          }} 
        />
        
        {tickets.map((ticket, idx) => {
          if (!ticket.location || !ticket.location.lat || !ticket.location.lng) return null;
          
          let markerColor = 'blue';
          if (ticket.priority === 'HIGH' || ticket.priority === 'High Priority' || ticket.priority === 'Urgent') markerColor = 'red';
          if (ticket.priority === 'MEDIUM' || ticket.priority === 'Medium Priority') markerColor = 'gold';

          return (
            <Marker 
              key={ticket.id || idx} 
              position={[ticket.location.lat, ticket.location.lng]}
              icon={createCustomIcon(markerColor)}
            >
              <Popup>
                <div className="text-left min-w-[210px] p-1 font-sans">
                  <h5 className="font-extrabold text-slate-900 text-sm mb-1 leading-tight">{ticket.subject}</h5>
                  <p className="text-xs text-slate-600 mb-2 font-medium">{ticket.location?.address || 'San Vicente, Apalit'}</p>
                  <div className="flex justify-between items-center text-[10px] font-extrabold">
                    <span className={`px-2 py-0.5 rounded-md ${markerColor === 'red' ? 'bg-red-100 text-red-700' : markerColor === 'gold' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {ticket.priority || 'Normal'}
                    </span>
                    <span className="text-slate-500">{ticket.status}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DashboardMap;
