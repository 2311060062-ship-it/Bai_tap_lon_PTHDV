export type User = {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  active?: boolean;
  role: string;
  emailVerified?: boolean;
};

export type Car = {
  carId: number;
  carName: string;
  imageUrl?: string;
  location?: string;
  quantity: number;
  status: string;
  brandId: number;
  brandName: string;
  carTypeId: number;
  carTypeName: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  unit?: string;
  color?: string;
  description?: string;
  engine?: string;
  fuelType?: string;
  licensePlate?: string;
  seatCount?: number;
  year?: number;
  images?: string[];
  rentedFrom?: string | null;
  rentedUntil?: string | null;
};

export type Brand = { brandId: number; brandName: string; description?: string };
export type CarType = { carTypeId: number; typeName: string };

export type Booking = {
  bookingId: number;
  userId: number;
  customerId: number;
  customerName: string;
  carId: number;
  carName: string;
  pickupDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  pickupLocation?: string;
  returnLocation?: string;
  status: string;
  depositAmount: number;
  totalAmount: number;
  paidAmount: number;
  notes?: string;
};

export type News = {
  newsId: number;
  title: string;
  content: string;
  authorName?: string;
  createdAt?: string;
};

export type ContactMessage = {
  messageId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  messageContent: string;
  status: string;
  createdAt?: string | null;
  userId?: number | null;
};

export type Customer = {
  customerId: number;
  userId?: number;
  username?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  birthDate?: string;
  idNumber?: string;
  licenseNumber?: string;
  status: string;
  createdAt?: string;
};

export type Payment = {
  paymentId: number;
  bookingId: number;
  userId?: number;
  amount: number;
  paymentMethod: string;
  status: string;
  paymentDate?: string;
  customerName?: string;
  carName?: string;
};

export type Dashboard = {
  totalUsers: number;
  totalCustomers: number;
  totalCars: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
};

export type RevenueReport = {
  totalRevenue: number;
  monthRevenue: number;
  remainingReceivable: number;
  paidTransactions: number;
  months: { label: string; key: string; revenue: number; bookings: number }[];
  byCar: { name: string; value: number }[];
  byMethod: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
};
