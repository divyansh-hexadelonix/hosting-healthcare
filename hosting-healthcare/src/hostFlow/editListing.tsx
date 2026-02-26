import React, { useState, useRef, useEffect, useMemo } from "react";
import "./editListing.css";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Search,
  ParkingSquare,
  Wifi,
  Wind,
  WashingMachine,
  UtensilsCrossed,
  ShoppingBasket,
  Bath,
  Home,
  Building2,
  DoorOpen,
  X,
  Plus,
  Upload,
  CalendarX,
} from "lucide-react";
import { ListingRow, getPropertyBlockedRanges } from "./MyListing";

const AMENITY_LIST = [
  { key: "parking", label: "Free Parking", Icon: ParkingSquare },
  { key: "wifi", label: "Wifi", Icon: Wifi },
  { key: "ac", label: "Air Conditioner", Icon: Wind },
  { key: "laundry", label: "Laundry", Icon: WashingMachine },
  { key: "kitchen", label: "Kitchen", Icon: UtensilsCrossed },
  { key: "kitchen_essentials", label: "Kitchen Essential", Icon: ShoppingBasket },
  { key: "washroom", label: "Washroom Essential", Icon: Bath },
];

const PLACE_TYPES = [
  { key: "Private room", label: "Private Room", Icon: DoorOpen },
  { key: "Apartments/Condo", label: "Apartments/Condo", Icon: Building2 },
  { key: "Entire Home", label: "Entire Home", Icon: Home },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Holy See", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

interface EditListingProps {
  listing: ListingRow;
  onCancel: () => void;
  onSave: (updatedListing: ListingRow) => void;
}

const EditListing: React.FC<EditListingProps> = ({ listing, onCancel, onSave }) => {
  const [form, setForm] = useState({
    propertyName: listing.propertyName || "",
    price: listing.price ? listing.price.replace(/[^0-9.]/g, "") : "",
    description: listing.description || "",
    capacity: listing.capacity || "",
    amenities: listing.amenities || [],
    address: listing.address || "",
    country: listing.country || "",
    city: listing.city || "",
    state: listing.state || "",
    zipCode: listing.zipCode || "",
  });

  const [images, setImages] = useState<(string | null)[]>([
    listing.image || null, null, null, null, null,
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryRef = useRef<HTMLDivElement>(null);
  
  // Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<{ type: "booked" | "unavailable"; start: Date; end: Date }[]>([]);
  const [tempOverrides, setTempOverrides] = useState<Record<string, string>>({});
  const [actionModal, setActionModal] = useState<{ date: Date, type: 'block' | 'unblock' } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCalendarOpen && listing.propertyName) {
      // Load booked ranges only (ignore existing LS overrides for now, we load them into tempOverrides)
      const ranges = getPropertyBlockedRanges(listing.propertyName);
      setBlockedRanges(ranges.filter(r => r.type === 'booked'));

      // Load existing overrides into temp state
      const allOverrides = JSON.parse(localStorage.getItem("hh_property_overrides") || "{}");
      const propOverrides = allOverrides[listing.propertyName]?.blockedDates || {};
      setTempOverrides({ ...propOverrides });
    }
  }, [isCalendarOpen, listing.propertyName]);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const set = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  const toggleAmenity = (key: string) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(key)
        ? p.amenities.filter((a) => a !== key)
        : [...p.amenities, key],
    }));

  const handleImageUpload = (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages((prev) => {
        const updated = [...prev];
        updated[idx] = ev.target?.result as string;
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (idx: number) =>
    setImages((prev) => {
      const updated = [...prev];
      updated[idx] = null;
      return updated;
    });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.propertyName.trim()) errs.propertyName = "Property name is required";
    if (!form.price.trim()) errs.price = "Price is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.capacity) errs.capacity = "Please select a place type";
    if (!images.some(Boolean)) errs.images = "At least one image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const primaryImage = images.find(Boolean) || "";
    
    onSave({
      ...listing,
      propertyName: form.propertyName.trim(),
      city: form.city.trim(),
      price: `$${form.price}`,
      description: form.description,
      capacity: form.capacity,
      amenities: form.amenities,
      address: form.address,
      country: form.country,
      state: form.state,
      zipCode: form.zipCode,
      image: primaryImage,
    });
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'prev', date: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, type: 'current', date: new Date(year, month, i) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, type: 'next', date: null });
    }
    return days;
  }, [viewDate]);

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setIsMonthDropdownOpen(false);
  };

  const isDateBlocked = (date: Date) => {
    const d = new Date(date); d.setHours(0, 0, 0, 0);
    return blockedRanges.find((r) => d >= r.start && d <= r.end) || null;
  };

  const handleDateClick = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (d < today) return; // Past dates unclickable

    // Check if booked
    const isBooked = blockedRanges.some(r => d >= r.start && d <= r.end);
    if (isBooked) return;

    const key = getDateKey(d);
    const isBlocked = tempOverrides[key] === 'Unavailable';

    setActionModal({
      date: d,
      type: isBlocked ? 'unblock' : 'block'
    });
  };

  const confirmAction = () => {
    if (!actionModal) return;
    const key = getDateKey(actionModal.date);
    setTempOverrides(prev => {
      const next = { ...prev };
      if (actionModal.type === 'block') {
        next[key] = 'Unavailable';
      } else {
        delete next[key];
      }
      return next;
    });
    setActionModal(null);
  };

  const handleCalendarSubmit = () => {
    // Save tempOverrides to LS
    try {
      const allOverrides = JSON.parse(localStorage.getItem("hh_property_overrides") || "{}");
      if (!allOverrides[listing.propertyName]) allOverrides[listing.propertyName] = {};
      allOverrides[listing.propertyName].blockedDates = tempOverrides;
      localStorage.setItem("hh_property_overrides", JSON.stringify(allOverrides));
      window.dispatchEvent(new Event("hh_requests_updated"));
    } catch {}
    setIsCalendarOpen(false);
  };

  return (
    <div className="el-wrapper">
      <div className="el-page-header">
        <h2 className="el-page-title">Edit Listing</h2>
        <p className="el-page-sub">Update the information for your listing</p>
      </div>

      <div className="el-form">
        {/* Row 1: Name + Price */}
        <div className="el-row-2">
          <div className="el-field">
            <label className="el-label">Property Name</label>
            <input
              className={`el-input ${errors.propertyName ? "el-input--err" : ""}`}
              placeholder="e.g. Beach House in Yonkers, United States"
              value={form.propertyName}
              onChange={(e) => set("propertyName", e.target.value)}
            />
            {errors.propertyName && (
              <span className="el-err">{errors.propertyName}</span>
            )}
          </div>
          <div className="el-field">
            <label className="el-label">
              Price <span className="el-label-muted">/ per day</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '14px' }}>$</span>
              <input
                className={`el-input ${errors.price ? "el-input--err" : ""}`}
                placeholder="00"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                style={{ paddingLeft: '24px' }}
              />
            </div>
            {errors.price && <span className="el-err">{errors.price}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="el-field">
          <label className="el-label">Property Description</label>
          <textarea
            className="el-textarea"
            placeholder="Add Description...."
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Place Type */}
        <div className="el-section">
          <label className="el-label">
            Which of these best describes your place?
          </label>
          {errors.capacity && (
            <span className="el-err">{errors.capacity}</span>
          )}
          <div className="el-type-group">
            {PLACE_TYPES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`el-type-btn ${form.capacity === key ? "el-type-btn--active" : ""}`}
                onClick={() => set("capacity", key)}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', boxShadow: 'none', WebkitTouchCallout: 'none' }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="el-section">
          <label className="el-label">Availability</label>
          <button type="button" className="el-avail-btn" onClick={() => setIsCalendarOpen(true)}>
            <CalendarDays size={17} />
            Manage Availability
          </button>
        </div>

        {/* Amenities */}
        <div className="el-section">
          <label className="el-label">Tell us what your place offers?</label>
          <div className="el-amenity-grid">
            {AMENITY_LIST.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`el-amenity-btn ${form.amenities.includes(key) ? "el-amenity-btn--active" : ""}`}
                onClick={() => toggleAmenity(key)}
                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', outline: 'none', boxShadow: 'none', WebkitTouchCallout: 'none' }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="el-section">
          <label className="el-label el-label--req">Address</label>

          <div className="el-row-2" style={{ marginBottom: 14 }}>
            <div className="el-field">
              <label className="el-sublabel">Property Address</label>
              <input
                className="el-input"
                placeholder="Enter property address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className="el-field">
              <label className="el-sublabel">Country</label>
              <div className="el-select-wrap" ref={countryRef}>
                <div 
                  className="el-select" 
                  onClick={() => setCountryOpen(!countryOpen)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  {form.country || "Select Country"}
                  <ChevronDown size={14} className="el-select-arrow" />
                </div>
                
                {countryOpen && (
                  <div className="el-country-dropdown">
                    <div className="el-country-search">
                      <Search size={14} color="#888" />
                      <input 
                        type="text" 
                        placeholder="Search country..." 
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="el-country-list">
                      {filteredCountries.map(c => (
                        <div key={c} className="el-country-item" onClick={() => { set("country", c); setCountryOpen(false); setCountrySearch(""); }}>
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="el-row-2" style={{ marginBottom: 14 }}>
            <div className="el-field">
              <label className="el-sublabel">City</label>
              <input
                className={`el-input ${errors.city ? "el-input--err" : ""}`}
                placeholder="Enter city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              {errors.city && <span className="el-err">{errors.city}</span>}
            </div>
            <div className="el-field">
              <label className="el-sublabel">State</label>
              <input
                className="el-input"
                placeholder="Enter State"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
          </div>

          <div className="el-field" style={{ maxWidth: 380 }}>
            <label className="el-sublabel">Zip Code</label>
            <input
              className="el-input"
              placeholder="Enter Zip Code"
              value={form.zipCode}
              onChange={(e) => set("zipCode", e.target.value)}
            />
          </div>
        </div>

        {/* Property Images */}
        <div className="el-section">
          <label className="el-label">Property Image</label>
          {errors.images && <span className="el-err">{errors.images}</span>}
          <div className="al-img-grid">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div key={idx} className="al-img-slot">
                <input
                  ref={fileInputRefs[idx]}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageUpload(idx, e)}
                />
                {images[idx] ? (
                  <div className="al-img-preview">
                    <img src={images[idx]!} alt={`Property ${idx + 1}`} />
                    <button
                      className="al-img-remove"
                      onClick={() => removeImage(idx)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="al-img-add"
                    onClick={() => fileInputRefs[idx].current?.click()}
                  >
                    {idx < 3 ? (
                      <Plus size={26} />
                    ) : (
                      <span className="al-img-add-label">
                        <Upload size={14} />
                        Add Image
                      </span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="el-footer">
          <button type="button" className="el-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="el-btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="calendar-header">
              <h3>Manage Availability</h3>
              <button className="calendar-close-btn" onClick={() => setIsCalendarOpen(false)}><X size={24}/></button>
            </div>
            
            <div className="calendar-legend">
              <div className="legend-item"><span className="dot purple"></span> Available</div>
              <div className="legend-item"><span className="dot red"></span> Unavailable</div>
              <div className="legend-item"><span className="dot green"></span> Booked</div>
            </div>

            <div
              className="calendar-month-selector"
              style={{position: 'relative', cursor: 'pointer'}}
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
            >
              <span>{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
              {isMonthDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isMonthDropdownOpen && (
                <div className="month-dropdown" style={{
                  position: 'absolute', top: '100%', left: '0', background: 'white',
                  border: '1px solid #ddd', borderRadius: '8px', zIndex: 10,
                  maxHeight: '200px', overflowY: 'auto', width: '100%',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left'
                }} onClick={(e) => e.stopPropagation()}>
                  {months.map((m, i) => (
                    <div
                      key={m}
                      onClick={() => handleMonthSelect(i)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: viewDate.getMonth() === i ? '#f0f0f0' : 'white',
                        color: '#333'
                      }}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="calendar-days-header">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>

            <div className="calendar-grid">
              {calendarDays.map((dayObj, index) => {
                if (dayObj.type === 'prev' || dayObj.type === 'next') {
                  return <div key={index} className="calendar-day faded">{dayObj.day}</div>;
                }
                const d = dayObj.date!;
                const today = new Date(); today.setHours(0,0,0,0);
                const isPast = d < today;
                
                // Check booked from ranges
                const bookedRange = blockedRanges.find(r => d >= r.start && d <= r.end);
                // Check unavailable from tempOverrides
                const isUnavailable = tempOverrides[getDateKey(d)] === 'Unavailable';

                let cls = "calendar-day";
                let style: React.CSSProperties = {};

                if (bookedRange) {
                  if (isPast) {
                    cls += " cal-booked-past";
                    style = { backgroundColor: 'rgba(34, 197, 94, 0.5)', cursor: 'not-allowed', color: '#fff' };
                  } else {
                    cls += " cal-booked-range";
                  }
                } else if (isPast) {
                  cls += " past";
                } else if (isUnavailable) {
                  cls += " cal-unavailable";
                } else {
                  cls += " available";
                }
                return (
                  <div 
                    key={index} 
                    className={cls} 
                    style={style}
                    onClick={() => handleDateClick(d)}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>

            <div className="calendar-footer">
              <button className="cal-btn cancel" onClick={() => setIsCalendarOpen(false)}>Close</button>
              <button className="cal-btn continue" onClick={handleCalendarSubmit}>Submit</button>
            </div>

            {/* Action Modal */}
            {actionModal && (
              <div className="date-action-modal">
                <div className="date-action-icon-wrapper">
                  <CalendarX size={32} color="white" />
                </div>
                <h4>
                  {actionModal.date.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h4>
                <div className="date-action-buttons">
                  <button className="date-action-btn cancel" onClick={() => setActionModal(null)}>Cancel</button>
                  <button className="date-action-btn confirm" onClick={confirmAction}>
                    {actionModal.type === 'block' ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditListing;