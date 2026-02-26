import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MyListing.css";
import "./AddListing.css";
import { propertiesData } from "../data/propertiesData";
import {
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Search,
  Pencil,
  CalendarDays,
  MapPin,
  Plus,
  Check,
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
  Upload,
  CalendarX,
  DollarSign,
} from "lucide-react";
import EditListing from "./editListing";

// Types

type StatusValue = "Available" | "Booked" | "Unavailable";

export interface ListingRow {
  id: string;
  propertyName: string;
  city: string;
  image: string;
  price: string;
  type: string;
  sessionType: string;
  hostName: string;
  hostEmail: string;
  isCustom?: boolean;
  capacity?: string;
  description?: string;
  placeType?: string;
  amenities?: string[];
  address?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  addedAt?: string;
}

// Helpers

const getTodayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const getTodayDisplay = (): string =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const parseFlexDate = (s: string): Date | null => {
  if (!s) return null;
  try {
    const parts = s.split("-");
    if (parts.length !== 3) return null;
    if (parts[0].length === 4)
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  } catch {
    return null;
  }
};

// Status Engine

const computeStatus = (propertyName: string, onDate?: Date): StatusValue => {
  const target = onDate ? new Date(onDate) : new Date();
  target.setHours(0, 0, 0, 0);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  const dateKey = `${y}-${m}-${d}`;

  // 1. Accepted booking active on this date → Booked
  try {
    const requests: any[] = JSON.parse(
      localStorage.getItem("hh_host_requests") || "[]"
    );
    const isBooked = requests.some((r) => {
      if (r.property !== propertyName) return false;
      if ((r.status || "").toLowerCase() !== "accepted") return false;
      const moveIn = parseFlexDate(r.moveIn);
      const moveOut = parseFlexDate(r.moveOut);
      if (!moveIn || !moveOut) return false;
      moveIn.setHours(0, 0, 0, 0);
      moveOut.setHours(0, 0, 0, 0);
      return target >= moveIn && target <= moveOut;
    });
    if (isBooked) return "Booked";
  } catch {}

  // 2. Manual Unavailable override
  try {
    const overrides: Record<string, any> = JSON.parse(
      localStorage.getItem("hh_property_overrides") || "{}"
    );
    if (overrides[propertyName]?.blockedDates?.[dateKey] === "Unavailable")
      return "Unavailable";
  } catch {}

  return "Available";
};

// Export helper for StayDetails calendar

export const getPropertyBlockedRanges = (
  propertyName: string
): { type: "booked" | "unavailable"; start: Date; end: Date }[] => {
  const ranges: { type: "booked" | "unavailable"; start: Date; end: Date }[] =
    [];

  try {
    const requests: any[] = JSON.parse(
      localStorage.getItem("hh_host_requests") || "[]"
    );
    requests.forEach((r) => {
      if (r.property !== propertyName) return;
      if ((r.status || "").toLowerCase() !== "accepted") return;
      const s = parseFlexDate(r.moveIn);
      const e = parseFlexDate(r.moveOut);
      if (s && e) ranges.push({ type: "booked", start: s, end: e });
    });
  } catch {}

  try {
    const overrides: Record<string, any> = JSON.parse(
      localStorage.getItem("hh_property_overrides") || "{}"
    );
    if (overrides[propertyName]?.blockedDates) {
      Object.keys(overrides[propertyName].blockedDates).forEach((dateStr) => {
        if (overrides[propertyName].blockedDates[dateStr] === "Unavailable") {
          const d = parseFlexDate(dateStr);
          if (d) {
            d.setHours(0, 0, 0, 0);
            ranges.push({ type: "unavailable", start: d, end: d });
          }
        }
      });
    }
  } catch {}

  return ranges;
};

// Build base listings from propertiesData

const baseListings: ListingRow[] = propertiesData.map((p) => ({
  id: String(p.id),
  propertyName: p.propertyName,
  city: p.city,
  image: p.image,
  price: p.price,
  type: p.type,
  sessionType: p.type === "villa" ? "Rent" : "Sale",
  hostName: p.hostName,
  hostEmail: p.hostEmail,
  isCustom: false,
  capacity: p.capacity,
  state: p.state,
  zipCode: p.zipCode,
  country: p.country,
  address: p.propertyAddress,
  description: p.propertyDescription,
  amenities: p.propertyOffers,
}));

// StatusDropdown

interface StatusDropdownProps {
  status: StatusValue;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ status }) => {
  const colorClass =
    status === "Available"
      ? "ml-status--available"
      : status === "Booked"
      ? "ml-status--booked"
      : "ml-status--unavailable";

  return (
    <div className="ml-status-wrap">
      <div className={`ml-status-btn ${colorClass}`} style={{ cursor: "default" }}>
        {status}
      </div>
    </div>
  );
};

// AddListing Form

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

interface AddListingFormProps {
  hostName: string;
  hostEmail: string;
  onCancel: () => void;
  onSubmit: (listing: ListingRow) => void;
}

const AddListingForm: React.FC<AddListingFormProps> = ({
  hostName,
  hostEmail,
  onCancel,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    propertyName: "",
    price: "",
    description: "",
    capacity: "",
    amenities: [] as string[],
    address: "",
    country: "United States of America",
    city: "",
    state: "",
    zipCode: "",
  });
  const [images, setImages] = useState<(string | null)[]>([
    null, null, null, null, null,
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
  const [blockedDates, setBlockedDates] = useState<Record<string, string>>({});
  const [actionModal, setActionModal] = useState<{ date: Date, type: 'block' | 'unblock' } | null>(null);

  // Subscription Modals State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (!form.capacity) errs.capacity = "Please select a place type";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!images.some(Boolean)) errs.images = "At least one image is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Check subscription status
    const hasSubscription = JSON.parse(localStorage.getItem('hh_has_subscription') || 'false');

    if (hasSubscription) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        const primaryImage =
          images.find(Boolean) ||
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500";
        
        // Save blocked dates to LS if any
        if (Object.keys(blockedDates).length > 0) {
          const allOverrides = JSON.parse(localStorage.getItem("hh_property_overrides") || "{}");
          const name = form.propertyName.trim();
          if (!allOverrides[name]) allOverrides[name] = {};
          allOverrides[name].blockedDates = blockedDates;
          localStorage.setItem("hh_property_overrides", JSON.stringify(allOverrides));
        }

        onSubmit({
          id: "custom-" + Date.now(),
          propertyName: form.propertyName.trim(),
          city: form.city.trim(),
          image: primaryImage!,
          price: `$${form.price}`,
          type: "villa",
          sessionType: "Sale",
          hostName,
          hostEmail,
          description: form.description,
          capacity: form.capacity,
          amenities: form.amenities,
          address: form.address,
          country: form.country,
          state: form.state,
          zipCode: form.zipCode,
          addedAt: new Date().toISOString(),
          isCustom: true,
        });
      }, 300); // 0.3 sec delay as requested
    } else {
      setShowUpgradeModal(true);
    }
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

  const handleDateClick = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (d < today) return; // Past dates unclickable

    const key = getDateKey(d);
    const isBlocked = blockedDates[key] === 'Unavailable';

    setActionModal({
      date: d,
      type: isBlocked ? 'unblock' : 'block'
    });
  };

  const confirmAction = () => {
    if (!actionModal) return;
    const key = getDateKey(actionModal.date);
    setBlockedDates(prev => {
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

  return (
    <div className="al-wrapper">
      <div className="al-page-header">
        <h2 className="al-page-title">Add New Listing</h2>
        <p className="al-page-sub">Fill the correct information to create the listing</p>
      </div>

      <div className="al-form">
        {/* Row 1: Name + Price */}
        <div className="al-row-2">
          <div className="al-field">
            <label className="al-label">Property Name</label>
            <input
              className={`al-input ${errors.propertyName ? "al-input--err" : ""}`}
              placeholder="e.g. Beach House in Yonkers, United States"
              value={form.propertyName}
              onChange={(e) => set("propertyName", e.target.value)}
            />
            {errors.propertyName && (
              <span className="al-err">{errors.propertyName}</span>
            )}
          </div>
          <div className="al-field">
            <label className="al-label">
              Price <span className="al-label-muted">/ per day</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '14px' }}>$</span>
              <input
                className={`al-input ${errors.price ? "al-input--err" : ""}`}
                placeholder="00"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                style={{ paddingLeft: '24px' }}
              />
            </div>
            {errors.price && <span className="al-err">{errors.price}</span>}
          </div>
        </div>

        {/* Description */}
        <div className="al-field">
          <label className="al-label">Property Description</label>
          <textarea
            className="al-textarea"
            placeholder="Add Description...."
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Place Type */}
        <div className="al-section">
          <label className="al-label">
            Which of these best describes your place?
          </label>
          {errors.capacity && (
            <span className="al-err">{errors.capacity}</span>
          )}
          <div className="al-type-group">
            {PLACE_TYPES.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`al-type-btn ${form.capacity === key ? "al-type-btn--active" : ""}`}
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
        <div className="al-section">
          <label className="al-label">Availability</label>
          <button type="button" className="al-avail-btn" onClick={() => setIsCalendarOpen(true)}>
            <CalendarDays size={17} />
            Manage Availability
          </button>
        </div>

        {/* Amenities */}
        <div className="al-section">
          <label className="al-label">Tell us what your place offers?</label>
          <div className="al-amenity-grid">
            {AMENITY_LIST.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                className={`al-amenity-btn ${form.amenities.includes(key) ? "al-amenity-btn--active" : ""}`}
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
        <div className="al-section">
          <label className="al-label al-label--req">Address</label>

          <div className="al-row-2" style={{ marginBottom: 14 }}>
            <div className="al-field">
              <label className="al-sublabel">Property Address</label>
              <input
                className={`al-input ${errors.address ? "al-input--err" : ""}`}
                placeholder="Enter property address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
              {errors.address && (
                <span className="al-err">{errors.address}</span>
              )}
            </div>
            <div className="al-field">
              <label className="al-sublabel">Country</label>
              <div className="al-select-wrap" ref={countryRef}>
                <div 
                  className="al-select" 
                  onClick={() => setCountryOpen(!countryOpen)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  {form.country || "Select Country"}
                  <ChevronDown size={14} className="el-select-arrow" />
                </div>
                
                {countryOpen && (
                  <div className="al-country-dropdown">
                    <div className="al-country-search">
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
                    <div className="al-country-list">
                      {filteredCountries.map(c => (
                        <div key={c} className="al-country-item" onClick={() => { set("country", c); setCountryOpen(false); setCountrySearch(""); }}>
                          {c}
                        </div>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="al-country-empty">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="al-row-2" style={{ marginBottom: 14 }}>
            <div className="al-field">
              <label className="al-sublabel">City</label>
              <input
                className={`al-input ${errors.city ? "al-input--err" : ""}`}
                placeholder="Enter city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              {errors.city && <span className="al-err">{errors.city}</span>}
            </div>
            <div className="al-field">
              <label className="al-sublabel">State</label>
              <input
                className="al-input"
                placeholder="Enter State"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
          </div>

          <div className="al-field" style={{ maxWidth: 380 }}>
            <label className="al-sublabel">Zip Code</label>
            <input
              className="al-input"
              placeholder="Enter Zip Code"
              value={form.zipCode}
              onChange={(e) => set("zipCode", e.target.value)}
            />
          </div>
        </div>

        {/* Property Images */}
        <div className="al-section">
          <label className="al-label al-label--req">Property Image</label>
          {errors.images && <span className="al-err">{errors.images}</span>}
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
        <div className="al-footer">
          <button type="button" className="al-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="al-btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="calendar-header">
              <h3>Property Availability</h3>
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
                const isUnavailable = blockedDates[getDateKey(d)] === 'Unavailable';

                let cls = "calendar-day";
                if (isPast) cls += " past";
                else if (isUnavailable) cls += " cal-unavailable";
                else cls += " available";
                return (
                  <div 
                    key={index} 
                    className={cls}
                    onClick={() => handleDateClick(d)}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>

            <div className="calendar-footer">
              <button className="cal-btn cancel" onClick={() => setIsCalendarOpen(false)}>Close</button>
              <button className="cal-btn continue" onClick={() => setIsCalendarOpen(false)}>Submit</button>
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

      {/* Subscription Success Modal */}
      {showSuccessModal && (
        <div className="subscription-modal-overlay">
          <div className="subscription-modal">
            <div className="subscription-icon-wrapper">
              <Check size={32} color="white" strokeWidth={3} />
            </div>
            <h3 className="subscription-title">Your listing has been<br/>added!</h3>
          </div>
        </div>
      )}

      {/* Subscription Upgrade Modal */}
      {showUpgradeModal && (
        <div className="subscription-modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="subscription-modal" onClick={e => e.stopPropagation()}>
            <div className="subscription-icon-wrapper">
              <DollarSign size={32} color="white" strokeWidth={3} />
            </div>
            <h3 className="subscription-title">You are just one<br/>step away!</h3>
            <button className="subscription-btn" onClick={() => navigate('/pricing')}>
              $12.99 Monthly/Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main MyListing Component
const MyListing: React.FC = () => {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterCalOpen, setFilterCalOpen] = useState(false);
  const [filterCalView, setFilterCalView] = useState(new Date());
  const [filterCalMonthOpen, setFilterCalMonthOpen] = useState(false);
  const [filterSession, setFilterSession] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [statusMap, setStatusMap] = useState<Record<string, StatusValue>>({});
  const [customListings, setCustomListings] = useState<ListingRow[]>([]);
  const [editingListing, setEditingListing] = useState<ListingRow | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const sessionRef = useRef<HTMLDivElement>(null);
  const dateCalRef = useRef<HTMLDivElement>(null);

  // Host user from localStorage
  const hostUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hh_host_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Load custom listings
  const loadCustom = useCallback(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("hh_new_listings") || "[]");
      setCustomListings(raw);
    } catch {
      setCustomListings([]);
    }
  }, []);

  // Refresh status map
  const refreshStatuses = useCallback(() => {
    const date = filterDate ? parseFlexDate(filterDate) || undefined : undefined;
    const all = [...baseListings, ...customListings];
    const map: Record<string, StatusValue> = {};
    all.forEach((l) => {
      map[l.propertyName] = computeStatus(l.propertyName, date);
    });
    setStatusMap(map);
  }, [filterDate, customListings]);

  useEffect(() => {
    loadCustom();
  }, [loadCustom]);

  useEffect(() => {
    refreshStatuses();
    const handler = () => refreshStatuses();
    window.addEventListener("hh_requests_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("hh_requests_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refreshStatuses]);

  // Close session dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sessionRef.current && !sessionRef.current.contains(e.target as Node))
        setSessionOpen(false);
    };
    if (sessionOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sessionOpen]);

  // Close filter calendar on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateCalRef.current && !dateCalRef.current.contains(e.target as Node)) {
        setFilterCalOpen(false);
        setFilterCalMonthOpen(false);
      }
    };
    if (filterCalOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterCalOpen]);

  // Load edits for base listings
  const listingEdits = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("hh_listing_edits") || "{}");
    } catch {
      return {};
    }
  }, [view]); // Refresh when view changes (after save)

  const allListings = useMemo<ListingRow[]>(
    () => {
      const mergedBase = baseListings.map(l => listingEdits[l.id] ? { ...l, ...listingEdits[l.id] } : l);
      return [...mergedBase, ...customListings];
    },
    [customListings, listingEdits]
  );

  const filteredListings = useMemo(() => {
    return allListings.filter((l) => {
      const matchSearch =
        !searchText ||
        l.propertyName.toLowerCase().includes(searchText.toLowerCase()) ||
        l.city.toLowerCase().includes(searchText.toLowerCase());
      const matchSession = !filterSession || l.sessionType === filterSession;
      return matchSearch && matchSession;
    });
  }, [allListings, searchText, filterSession]);

  const handleAddSubmit = (listing: ListingRow) => {
    try {
      const existing: ListingRow[] = JSON.parse(
        localStorage.getItem("hh_new_listings") || "[]"
      );
      const updated = [listing, ...existing];
      localStorage.setItem("hh_new_listings", JSON.stringify(updated));
      setCustomListings(updated);
    } catch {}
    setView("list");
    window.dispatchEvent(new Event("hh_requests_updated"));
  };

  const handleEdit = (listing: ListingRow) => {
    setEditingListing(listing);
    setView("edit");
  };

  const handleSaveEdit = (updatedListing: ListingRow) => {
    if (updatedListing.isCustom) {
      // Update custom listing in localStorage
      const existing: ListingRow[] = JSON.parse(localStorage.getItem("hh_new_listings") || "[]");
      const updated = existing.map(l => l.id === updatedListing.id ? updatedListing : l);
      localStorage.setItem("hh_new_listings", JSON.stringify(updated));
      setCustomListings(updated);
    } else {
      // Save edit for base listing
      const edits = JSON.parse(localStorage.getItem("hh_listing_edits") || "{}");
      edits[updatedListing.id] = updatedListing;
      localStorage.setItem("hh_listing_edits", JSON.stringify(edits));
    }
    setView("list");
    setEditingListing(null);
    window.dispatchEvent(new Event("hh_requests_updated"));
  };

  const handleReset = () => {
    setFilterDate("");
    setFilterCalView(new Date());
    setFilterSession("");
    setSearchText("");
  };

  // Add Listing View
  if (view === "add") {
    return (
      <AddListingForm
        hostName={hostUser?.name || "David Beckham"}
        hostEmail={hostUser?.email || "david@gmail.com"}
        onCancel={() => setView("list")}
        onSubmit={handleAddSubmit}
      />
    );
  }

  // Edit Listing View
  if (view === "edit" && editingListing) {
    return (
      <EditListing
        listing={editingListing}
        onCancel={() => { setView("list"); setEditingListing(null); }}
        onSave={handleSaveEdit}
      />
    );
  }

  // List View — precompute filter calendar panel (avoids IIFE in JSX which breaks TSX parser)
  const todayFC = new Date(); todayFC.setHours(0, 0, 0, 0);
  const yearFC = filterCalView.getFullYear();
  const monthFC = filterCalView.getMonth();
  const firstDayFC = new Date(yearFC, monthFC, 1).getDay();
  const startOffsetFC = firstDayFC === 0 ? 6 : firstDayFC - 1;
  const daysInMonthFC = new Date(yearFC, monthFC + 1, 0).getDate();
  const daysInPrevFC = new Date(yearFC, monthFC, 0).getDate();
  const fcDays: { day: number; type: string; date: Date | null }[] = [];
  for (let i = startOffsetFC - 1; i >= 0; i--)
    fcDays.push({ day: daysInPrevFC - i, type: "prev", date: null });
  for (let i = 1; i <= daysInMonthFC; i++)
    fcDays.push({ day: i, type: "current", date: new Date(yearFC, monthFC, i) });
  const remainingFC = 42 - fcDays.length;
  for (let i = 1; i <= remainingFC; i++)
    fcDays.push({ day: i, type: "next", date: null });
  const selectedDateFC = filterDate ? parseFlexDate(filterDate) : null;

  const filterCalendarPanel = filterCalOpen ? (
    <div className="fc-dropdown-panel" onClick={(e) => e.stopPropagation()}>
      {/* Month/Year selector */}
      <div className="fc-month-selector" onClick={() => setFilterCalMonthOpen((p) => !p)}>
        <span>{months[monthFC]} {yearFC}</span>
        {filterCalMonthOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {filterCalMonthOpen && (
          <div className="fc-month-list" onClick={(e) => e.stopPropagation()}>
            {months.map((m, i) => (
              <div
                key={m}
                className={`fc-month-item ${monthFC === i ? "active" : ""}`}
                onClick={() => {
                  setFilterCalView(new Date(yearFC, i, 1));
                  setFilterCalMonthOpen(false);
                }}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prev/Next month nav */}
      <div className="fc-year-nav">
        <button className="fc-nav-btn" onClick={() => setFilterCalView(new Date(yearFC, monthFC - 1, 1))}>‹</button>
        <button className="fc-nav-btn" onClick={() => setFilterCalView(new Date(yearFC, monthFC + 1, 1))}>›</button>
      </div>

      {/* Day headers */}
      <div className="fc-days-header">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <span key={d}>{d}</span>)}
      </div>

      {/* Date grid */}
      <div className="fc-grid">
        {fcDays.map((dayObj, idx) => {
          if (dayObj.type !== "current") {
            return <div key={idx} className="fc-day fc-day--faded">{dayObj.day}</div>;
          }
          const d = dayObj.date!;
          const isPast = d < todayFC;
          const isSelected = selectedDateFC &&
            d.getFullYear() === selectedDateFC.getFullYear() &&
            d.getMonth() === selectedDateFC.getMonth() &&
            d.getDate() === selectedDateFC.getDate();
          const isToday =
            d.getFullYear() === todayFC.getFullYear() &&
            d.getMonth() === todayFC.getMonth() &&
            d.getDate() === todayFC.getDate();

          let cls = "fc-day";
          if (isPast) cls += " fc-day--past";
          else if (isSelected) cls += " fc-day--selected";
          else if (isToday) cls += " fc-day--today";
          else cls += " fc-day--available";

          return (
            <div
              key={idx}
              className={cls}
              onClick={() => {
                if (isPast) return;
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                setFilterDate(`${y}-${m}-${dd}`);
                setFilterCalOpen(false);
                setFilterCalMonthOpen(false);
              }}
            >
              {dayObj.day}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="listing-wrapper">
      {/* Header */}
      <div className="listing-header-section">
        <h2 className="listing-title">My Listings</h2>
      </div>

      {/* Toolbar */}
      <div className="toolbar-section">
        <div className="toolbar-filters">
          {/* Filter icon + label */}
          <div className="filter-icon-box">
            <Filter size={16} color="#555" />
          </div>
          <span className="filter-label">Filter By</span>
          <div className="toolbar-divider" />

          {/* Date filter - custom calendar dropdown */}
          <div className="filter-item date-filter-wrap" ref={dateCalRef} style={{ position: "relative" }}>
            <div
              className="ml-dropdown"
              style={{ minWidth: "auto", gap: 6 }}
              onClick={() => {
                setFilterCalOpen((p) => !p);
                setFilterCalMonthOpen(false);
              }}
            >
              <CalendarDays size={13} color="#6d28d9" />
              <span style={{ color: filterDate ? "#6d28d9" : "#444", fontWeight: filterDate ? 600 : 400 }}>
                {filterDate
                  ? parseFlexDate(filterDate)?.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Date"}
              </span>
              <ChevronDown
                size={13}
                color="#888"
                style={{
                  transform: filterCalOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
              {filterDate && (
                <span
                  style={{ marginLeft: 2, cursor: "pointer", color: "#aaa", lineHeight: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterDate("");
                    setFilterCalView(new Date());
                  }}
                >
                  <X size={12} />
                </span>
              )}
            </div>

            {/* Calendar dropdown panel */}
            {filterCalendarPanel}
          </div>

          <div className="toolbar-divider" />

          {/* Session Type Dropdown */}
          <div className="filter-item" ref={sessionRef}>
            <div
              className="ml-dropdown"
              onClick={() => setSessionOpen((p) => !p)}
            >
              <span>{filterSession || "Session Type"}</span>
              <ChevronDown
                size={13}
                color="#888"
                style={{
                  transform: sessionOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
              {sessionOpen && (
                <div className="ml-dropdown-menu">
                  {["", "Sale", "Rent", "Lease"].map((opt) => (
                    <div
                      key={opt || "all"}
                      className={`ml-dropdown-item ${filterSession === opt ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterSession(opt);
                        setSessionOpen(false);
                      }}
                    >
                      {opt || "All"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-divider" />

          {/* Search */}
          <div className="filter-item search-item">
            <Search size={14} color="#aaa" className="search-icon-inside" />
            <input
              type="text"
              className="filter-search"
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="toolbar-divider" />

          {/* Reset */}
          <div className="filter-item reset-item" onClick={handleReset}>
            <RotateCcw size={14} color="#e74c3c" />
            <span className="reset-text">Reset Filter</span>
          </div>
        </div>

        <button className="btn-add-listing" onClick={() => setView("add")}>
          Add New Listing <Plus size={14} />
        </button>
      </div>

      {/* Table */}
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
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  No properties found.
                </td>
              </tr>
            ) : (
              filteredListings.map((listing, idx) => {
                const status = statusMap[listing.propertyName] ?? "Available";
                return (
                  <tr
                    key={listing.id}
                    className={`table-row ${idx % 2 === 0 ? "row-even" : "row-odd"}`}
                  >
                    <td className="img-cell">
                      <img
                        src={listing.image}
                        alt={listing.propertyName}
                        className="property-img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=120&h=80&fit=crop";
                        }}
                      />
                    </td>
                    <td className="name-cell">{listing.propertyName}</td>
                    <td className="location-cell">
                      <MapPin size={13} className="loc-icon" />
                      {listing.city}
                    </td>
                    <td className="price-cell">{listing.price} / night</td>
                    <td className="status-cell">
                      <StatusDropdown
                        status={status}
                      />
                    </td>
                    <td className="action-cell">
                      <button className="btn-edit" onClick={() => handleEdit(listing)}>
                        <Pencil size={13} />
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyListing;