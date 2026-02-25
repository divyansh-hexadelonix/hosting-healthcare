import React, { useState, useMemo } from "react";
import "./MyListing.css";
import { 
  Zap,
  Check,
  BarChart2,
  Star,
  Filter,
  Search,
  RotateCcw,
  ChevronDown
} from 'lucide-react';


interface Property {
  id: number;
  image: string;
  name: string;
  location: string;
  price: string;
  status: "Available" | "Booked";
  date: string;
  sessionType: string;
}

const mockData: Property[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=80&fit=crop",
    name: "Sea View Mansion",
    location: "Mumbai, Maharashtra",
    price: "$3,500/night",
    status: "Available",
    date: "06/03/2026",
    sessionType: "Sale",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=120&h=80&fit=crop",
    name: "Luxury Hill Resort",
    location: "Pune, Maharashtra",
    price: "$7,000/night",
    status: "Booked",
    date: "10-04-2026",
    sessionType: "Lease",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=80&fit=crop",
    name: "Royal Palace Hotel",
    location: "Delhi, NCR",
    price: "$5,000/night",
    status: "Available",
    date: "26-02-2026",
    sessionType: "Sale",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=120&h=80&fit=crop",
    name: "Blue Bay Residence",
    location: "Goa, South Goa",
    price: "$8,000/night",
    status: "Booked",
    date: "16-03-2026",
    sessionType: "Rent",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=120&h=80&fit=crop",
    name: "Modern Tech Hub Stay",
    location: "Bangalore, Karnataka",
    price: "$4,000/night",
    status: "Available",
    date: "20-01-25",
  sessionType: "Sale",
  },
];

const MyListing: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(mockData);
  const [filterDate, setFilterDate] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchDate = filterDate ? p.date === filterDate : true;
      const matchSession = filterSession ? p.sessionType === filterSession : true;
      const matchSearch = searchText
        ? p.name.toLowerCase().includes(searchText.toLowerCase()) ||
          p.location.toLowerCase().includes(searchText.toLowerCase())
        : true;
      return matchDate && matchSession && matchSearch;
    });
  }, [properties, filterDate, filterSession, searchText]);

  const handleResetFilters = () => {
    setFilterDate("");
    setFilterSession("");
    setSearchText("");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    alert(`Edit property with ID: ${id}`);
  };

  const handleAddNew = () => {
    alert("Add New Listing clicked!");
  };

  return (
    <div className="listing-wrapper">
      <div className="listing-header-section">
        <h2 className="listing-title">My Listings</h2>
        <span className="listing-count">{filteredProperties.length} Properties</span>
      </div>

      <div className="toolbar-section">

        <div className="toolbar-filters">

           <div className="filter-icon-box">
            <Filter size={18} color="#555" />
          </div>
          <span className="filter-label">Filter By</span>

          <div className="filter-item">
            <input
              type="date"
              className="filter-date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              title="Filter by Date"
            />
          </div>

          <div className="toolbar-divider" />

          <div className="filter-item">
            <select
              className="filter-select"
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            >
              <option value="">Session Type</option>
              <option value="Sale">Sale</option>
              <option value="Rent">Rent</option>
              <option value="Lease">Lease</option>
            </select>
          </div>

          <div className="toolbar-divider" />

          <div className="filter-item search-item" onClick={handleResetFilters}>
            <span className="toolbar-icon"></span>
             <input
              type="text"
              className="filter-search" 
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="toolbar-divider" />

          <div className="filter-item reset-item" onClick={handleResetFilters}>
            <span className="toolbar-icon"> <RotateCcw size={18} /></span>
            <span className="reset-text">Reset Filter</span>
          </div>

        </div>

        <button className="btn-add-listing" onClick={handleAddNew}>
          Add New Listing +
        </button>

      </div>


      <div className="table-container">
        <table className="property-table">
          <thead>
            <tr className="table-header-row">
              <th>Property Image</th>
              <th>Property Name</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No properties found.
                </td>
              </tr>
            ) : (
              properties.map((property, index) => (
                <tr
                  key={property.id}
                  className={`table-row ${index % 2 === 0 ? "row-even" : "row-odd"}`}
                >
                  <td className="img-cell">
                    <img
                      src={property.image}
                      alt={property.name}
                      className="property-img"
                    />
                  </td>
                  <td className="name-cell">{property.name}</td>
                  <td className="location-cell">
                    <span className="location-icon"></span> {property.location}
                  </td>
                  <td className="price-cell">{property.price}</td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${
                        property.status === "Available"
                          ? "status-available"
                          : "status-booked"
                      }`}
                    >
                      {property.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(property.id)}
                    >
                       Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyListing;
