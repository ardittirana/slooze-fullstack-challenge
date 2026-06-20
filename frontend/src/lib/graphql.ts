import { gql } from '@apollo/client';

export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type Country = 'INDIA' | 'AMERICA';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  country: Country;
  menuItems: MenuItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  priceAtOrder: number;
  menuItem?: MenuItem | null;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  country: Country;
  status: OrderStatus;
  total: number;
  paymentMethodId?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  type: string;
  country: Country;
  details?: string | null;
}

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      country
    }
  }
`;

export const USERS = gql`
  query Users {
    users {
      id
      name
      role
      country
    }
  }
`;

export const RESTAURANTS = gql`
  query Restaurants {
    restaurants {
      id
      name
      country
      menuItems {
        id
        name
        description
        price
        restaurantId
      }
    }
  }
`;

export const ORDERS = gql`
  query Orders {
    orders {
      id
      userId
      restaurantId
      country
      status
      total
      paymentMethodId
      createdAt
      items {
        id
        quantity
        priceAtOrder
        menuItem {
          id
          name
        }
      }
    }
  }
`;

export const PAYMENT_METHODS = gql`
  query PaymentMethods {
    paymentMethods {
      id
      label
      type
      country
      details
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      total
    }
  }
`;

export const CHECKOUT_ORDER = gql`
  mutation CheckoutOrder($orderId: ID!, $paymentMethodId: ID) {
    checkoutOrder(orderId: $orderId, paymentMethodId: $paymentMethodId) {
      id
      status
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($input: AddPaymentMethodInput!) {
    addPaymentMethod(input: $input) {
      id
      label
    }
  }
`;
