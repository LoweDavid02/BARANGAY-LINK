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
  // Centered accurately on San Vicente town center, Apalit, Pampanga
  const defaultCenter = [14.9495, 120.7580];
  
  // Relaxed Bounding box for San Vicente, Apalit
  const sanVicenteBounds = [
    [14.9200, 120.7100],
    [14.9800, 120.7900]
  ];

  return (
    <div className="w-full relative z-0 rounded-2xl overflow-hidden shadow-inner border border-slate-800" style={{ height: 400 }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={16} 
        scrollWheelZoom={true}
        maxBounds={sanVicenteBounds}
        maxBoundsViscosity={0.5}
        minZoom={13}
        maxZoom={19}
        style={{ height: '100%', width: '100%', zIndex: 0, backgroundColor: '#0F172A' }}
      >
        {/* 1. BASE DARK MAP LAYER (ROADS & BUILDINGS) */}
        <TileLayer
          attribution='&copy; CARTO &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          maxNativeZoom={19}
          subdomains="abcd"
          zIndex={1}
        />
        
        {/* 2. MUNICIPAL BOUNDARY OVERLAY */}
        <GeoJSON 
          data={sanVicenteGeoJSON} 
          style={{
            color: '#38BDF8', // Neon Sky Blue outline
            weight: 2,
            opacity: 0.9,
            fillColor: '#0284C7',
            fillOpacity: 0.08,
            dashArray: '4, 4'
          }} 
        />

        {/* 3. HIGH-CONTRAST LABELS OVERLAY (STREET NAMES, ROADS, LANDMARKS ON TOP) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          maxNativeZoom={19}
          subdomains="abcd"
          zIndex={10}
        />
        
        {/* 4. TICKET MARKERS */}
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
