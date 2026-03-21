export interface User {
  _id: string;
  name: string;
  email: string;
  tel: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  region: string;
  open: string;
  close: string;
  id?: string;
}

export interface Reservation {
  _id: string;
  apptDate: string; 
  user: string | User; 
  restaurant: string | Restaurant; 
  Reservat_at: string;
  createdAt: string;
}

export interface RestaurantJson {
  success: boolean;
  count: number;
  data: Restaurant[];
}