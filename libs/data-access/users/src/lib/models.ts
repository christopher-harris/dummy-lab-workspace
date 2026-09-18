export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: UserHair;
  ip: string;
  address: UserAddress;
  macAddress: string;
  university: string;
  bank: UserBank;
  company: UserCompany;
  ein: string;
  ssn: string;
  userAgent: string;
  crypto: UserCrypto;
  role: UserRole;
}

export type UserRole = 'admin' | 'moderator' | 'user';

export interface UserHair {
  color: string;
  type: string;
}

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export interface UserAddress {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  coordinates: UserCoordinates;
  country: string;
}

export interface UserBank {
  cardExpire: string;
  cardNumber: string;
  cardType: string;
  currency: string;
  iban: string;
}

export interface UserCompany {
  department: string;
  name: string;
  title: string;
  address: UserAddress;
}

export interface UserCrypto {
  coin: string;
  wallet: string;
  network: string;
}
