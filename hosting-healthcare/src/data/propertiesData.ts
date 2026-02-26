import hotelImg from '../assets/hotel-swimming-pool.jpg';
import villaImg from '../assets/Villa image 1.png';
import swimingpoolImg from '../assets/Swiming_Pool_Villa.jpg';
import whitehouseImg from '../assets/White-house-villa-image.png';
import houseviewImg from '../assets/House-View-image.png';
import hotelviewpointImg from '../assets/Hotel View Point.jpg';
import tropicalbeachresortImg from '../assets/Tropical Beach Resort.jpg';
import sunsethotelImg from '../assets/Sunset view hotel.jpg';

export interface ReviewType {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  img: string;
}

export interface PropertyDataType {
  id: number | string;
  image: string;
  city: string;
  propertyName: string;
  capacity: string;
  available: boolean;
  reviews: number;
  rating: number;
  price: string;
  type: string;
  reviewsList: ReviewType[];
  hostName: string;
  hostEmail: string;
  state?: string;
  zipCode?: string;
  country?: string;
  propertyAddress?: string;
  propertyDescription?: string;
  propertyOffers?: string[];
}

const MOCK_REVIEWS: ReviewType[] = [
  { id: 1, name: "Maria Scholes", rating: 4.0, date: "Oct 2023", text: "Madona was incredibly insightful and accurate! His reading gave me so much clarity, and I feel more at peace now. Highly recommend!", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 2, name: "John Doe", rating: 5.0, date: "Sep 2023", text: "Great location and amazing host. The place was sparkling clean and exactly as described.", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 3, name: "Sarah Smith", rating: 4.5, date: "Aug 2023", text: "Lovely stay. Very quiet neighborhood and close to shops.", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 4, name: "Mike Ross", rating: 4.0, date: "Jul 2023", text: "Good value for money. Would definitely stay again.", img: "https://randomuser.me/api/portraits/men/85.jpg" },
];

export const propertiesData: PropertyDataType[] = [
     {
      id: 1,
      image: hotelviewpointImg,
      city: 'Pune',
      propertyName: 'Luxury Hill Resort',
      capacity: 'Private room',
      available: true,
      reviews: 428,
      rating: 4.8,
      price: '$5,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India',
      propertyAddress: '123 Hill Top Rd',
      propertyDescription: 'Escape to the serene hills of Pune in this luxury resort offering breathtaking views and world-class amenities. Perfect for a relaxing weekend getaway.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 2,
      image: whitehouseImg,
      city: 'Mumbai',
      propertyName: 'Sea View Mansion',
      capacity: 'Apartments/Condo',
      available: true,
      reviews: 612,
      rating: 4.9,
      price: '$3,500',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India',
      propertyAddress: '456 Sea View Dr',
      propertyDescription: 'Experience the vibrant city life of Mumbai with a stunning sea view from this spacious mansion. Located near top restaurants and attractions.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials'],
    },
    {
      id: 3,
      image: villaImg,
      city: 'Hyderabad',
      propertyName: 'Charming Heritage Villa',
      capacity: 'Entire Home',
      available: true,
      reviews: 356,
      rating: 4.7,
      price: '$6,499',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Telangana',
      zipCode: '500001',
      country: 'India',
      propertyAddress: '789 Heritage Ln',
      propertyDescription: 'Step back in time in this beautifully restored heritage villa in Hyderabad, blending tradition with modern comfort for a unique stay.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 4,
      image: houseviewImg,
      city: 'Bangalore',
      propertyName: 'Modern Tech Hub Stay',
      capacity: 'Private room',
      available: true,
      reviews: 289,
      rating: 4.6,
      price: '$4,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      propertyAddress: '101 Tech Hub Blvd',
      propertyDescription: 'Perfect for business travelers, this modern stay is located in the heart of Bangalore\'s tech hub, featuring high-speed internet and workspaces.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'washroom'],
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop',
      city: 'Delhi',
      propertyName: 'Royal Palace Hotel',
      capacity: 'Apartments/Condo',
      available: true,
      reviews: 721,
      rating: 4.8,
      price: '$5,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
      propertyAddress: '202 Royal Way',
      propertyDescription: 'Live like royalty in Delhi with opulent interiors and impeccable service at the Royal Palace Hotel. A truly majestic experience awaits.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 6,
      image: swimingpoolImg,
      city: 'Pune',
      propertyName: 'Green Valley Retreat',
      capacity: 'Entire Home',
      available: true,
      reviews: 445,
      rating: 4.7,
      price: '$6,000',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Maharashtra',
      zipCode: '411057',
      country: 'India',
      propertyAddress: '303 Green Valley Cir',
      propertyDescription: 'Reconnect with nature in this peaceful retreat nestled in the green valleys of Pune. Ideal for yoga, meditation, and nature walks.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 7,
      image: tropicalbeachresortImg,
      city: 'Mumbai',
      propertyName: 'Beachfront Paradise',
      capacity: 'Private room',
      available: true,
      reviews: 834,
      rating: 4.9,
      price: '$7,500',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Maharashtra',
      zipCode: '400050',
      country: 'India',
      propertyAddress: '404 Beachfront Ave',
      propertyDescription: 'Wake up to the sound of waves in this exclusive beachfront property in Mumbai. Enjoy direct access to the beach and stunning sunsets.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 8,
      image: hotelImg,
      city: 'Bangalore',
      propertyName: 'Elegant Garden Suite',
      capacity: 'Apartments/Condo',
      available: false,
      reviews: 567,
      rating: 4.8,
      price: '$4,800',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Karnataka',
      zipCode: '560034',
      country: 'India',
      propertyAddress: '505 Garden St',
      propertyDescription: 'Enjoy a tranquil stay in Bangalore with a private garden suite designed for relaxation. A hidden gem in the bustling city.',
      propertyOffers: ['wifi', 'parking', 'ac', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      city: 'Hyderabad',
      propertyName: 'White House Park Stay Inn',
      capacity: 'Entire Home',
      available: true,
      reviews: 392,
      rating: 4.7,
      price: '$3,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Telangana',
      zipCode: '500032',
      country: 'India',
      propertyAddress: '606 Park Ave',
      propertyDescription: 'A pristine and comfortable stay near the parks of Hyderabad, perfect for families looking for a quiet and safe neighborhood.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=400&fit=crop',
      city: 'Delhi',
      propertyName: 'Contemporary Loft',
      capacity: 'Private room',
      available: false,
      reviews: 276,
      rating: 4.5,
      price: '$4,200',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Delhi',
      zipCode: '110020',
      country: 'India',
      propertyAddress: '707 Loft St',
      propertyDescription: 'A stylish and contemporary loft in Delhi, offering a unique urban living experience with open spaces and modern art decor.',
      propertyOffers: ['wifi', 'parking', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 11,
      image: sunsethotelImg,
      city: 'Goa, Vagator',
      propertyName: 'Sunset Valley, Villa',
      capacity: 'Apartments/Condo',
      available: true,
      reviews: 503,
      rating: 4.8,
      price: '$8,000',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Goa',
      zipCode: '403509',
      country: 'India',
      propertyAddress: '808 Sunset Blvd',
      propertyDescription: 'Watch mesmerizing sunsets from your private villa in Vagator, Goa. Features a private pool and is just minutes away from the beach.',
      propertyOffers: ['wifi', 'parking', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
    {
      id: 12,
      image: whitehouseImg,
      city: 'Bangalore',
      propertyName: 'Premium Downtown Hotel',
      capacity: 'Entire Home',
      available: true,
      reviews: 618,
      rating: 4.7,
      price: '$5,200',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      propertyAddress: '909 Downtown Rd',
      propertyDescription: 'Stay in the center of action with this premium hotel in downtown Bangalore. Walking distance to major shopping centers and nightlife.',
      propertyOffers: ['wifi', 'ac', 'laundry', 'kitchen', 'kitchen_essentials', 'washroom'],
    },
];

export const mockBookingRequests = [
  {
    id: 101,
    guestName: 'Craig Thomas',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    moveIn: '10-03-2025',
    moveOut: '10-04-2025',
    property: 'Grand Canyon Horseshoe Bend',
    status: 'Pending'
  },
  {
    id: 102,
    guestName: 'Sarah Jenkins',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    moveIn: '15-04-2025',
    moveOut: '20-04-2025',
    property: 'Modern Loft in City Center',
    status: 'Pending'
  },
  {
    id: 103,
    guestName: 'Daniel Kyte',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    moveIn: '01-05-2025',
    moveOut: '05-05-2025',
    property: 'Cozy Beachfront Cottage',
    status: 'Pending'
  }
];