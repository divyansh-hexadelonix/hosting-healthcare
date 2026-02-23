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
  id: number;
  image: string;
  city: string;
  hotelName: string;
  capacity: string;
  available: boolean;
  reviews: number;
  rating: number;
  price: string;
  type: string;
  reviewsList: ReviewType[];
  hostName: string;
  hostEmail: string;
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
      hotelName: 'Luxury Hill Resort',
      capacity: 'Couples & Family',
      available: true,
      reviews: 428,
      rating: 4.8,
      price: '$5,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 2,
      image: whitehouseImg,
      city: 'Mumbai',
      hotelName: 'Sea View Mansion',
      capacity: 'Couples & Family',
      available: true,
      reviews: 612,
      rating: 4.9,
      price: '$3,500',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 3,
      image: villaImg,
      city: 'Hyderabad',
      hotelName: 'Charming Heritage Villa',
      capacity: 'Couples & Family',
      available: true,
      reviews: 356,
      rating: 4.7,
      price: '$6,499',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 4,
      image: houseviewImg,
      city: 'Bangalore',
      hotelName: 'Modern Tech Hub Stay',
      capacity: 'Family',
      available: true,
      reviews: 289,
      rating: 4.6,
      price: '$4,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop',
      city: 'Delhi',
      hotelName: 'Royal Palace Hotel',
      capacity: 'Couples & Family',
      available: true,
      reviews: 721,
      rating: 4.8,
      price: '$5,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 6,
      image: swimingpoolImg,
      city: 'Pune',
      hotelName: 'Green Valley Retreat',
      capacity: 'Couples & Family',
      available: true,
      reviews: 445,
      rating: 4.7,
      price: '$6,000',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 7,
      image: tropicalbeachresortImg,
      city: 'Mumbai',
      hotelName: 'Beachfront Paradise',
      capacity: 'Couples',
      available: true,
      reviews: 834,
      rating: 4.9,
      price: '$7,500',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 8,
      image: hotelImg,
      city: 'Bangalore',
      hotelName: 'Elegant Garden Suite',
      capacity: 'Couples & Family',
      available: false,
      reviews: 567,
      rating: 4.8,
      price: '$4,800',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=400&fit=crop',
      city: 'Hyderabad',
      hotelName: 'White House Park Stay Inn',
      capacity: 'Family',
      available: true,
      reviews: 392,
      rating: 4.7,
      price: '$3,000',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&h=400&fit=crop',
      city: 'Delhi',
      hotelName: 'Contemporary Loft',
      capacity: 'Couples',
      available: false,
      reviews: 276,
      rating: 4.5,
      price: '$4,200',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 11,
      image: sunsethotelImg,
      city: 'Goa, Vagator',
      hotelName: 'Sunset Valley, Villa',
      capacity: 'Couples & Family',
      available: true,
      reviews: 503,
      rating: 4.8,
      price: '$8,000',
      type: 'villa',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
    },
    {
      id: 12,
      image: whitehouseImg,
      city: 'Bangalore',
      hotelName: 'Premium Downtown Hotel',
      capacity: 'Family',
      available: true,
      reviews: 618,
      rating: 4.7,
      price: '$5,200',
      type: 'hotel',
      reviewsList: MOCK_REVIEWS,
      hostName: 'David Beckham',
      hostEmail: 'david@gmail.com',
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