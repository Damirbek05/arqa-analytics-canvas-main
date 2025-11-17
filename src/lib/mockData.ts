export interface Order {
  id: string;
  date: string;
  customer: string;
  city: string;
  channel: 'Web' | 'Mobile' | 'Offline';
  status: 'New' | 'Processing' | 'Shipped' | 'Delivered';
  total: number;
  items?: OrderItem[];
  comment?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  city: string;
  ltv: number;
  ordersCount: number;
  createdAt: string;
}

export interface DashboardFilters {
  period: '7d' | '30d' | 'QTD' | 'YTD' | 'custom';
  startDate?: string;
  endDate?: string;
  channel?: string;
  city?: string;
}

// Mock data generation
export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    date: '2024-01-15',
    customer: 'Алексей Иванов',
    city: 'Алматы',
    channel: 'Web',
    status: 'Delivered',
    total: 45000,
    items: [
      { id: '1', name: 'Laptop ASUS', quantity: 1, price: 45000 }
    ],
    comment: 'Доставка в офис'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-01-16',
    customer: 'Мария Петрова',
    city: 'Астана',
    channel: 'Mobile',
    status: 'Shipped',
    total: 12500,
    items: [
      { id: '2', name: 'Smartphone', quantity: 1, price: 12500 }
    ]
  },
  {
    id: 'ORD-2024-003',
    date: '2024-01-17',
    customer: 'Дмитрий Сидоров',
    city: 'Шымкент',
    channel: 'Offline',
    status: 'Processing',
    total: 8750,
    items: [
      { id: '3', name: 'Headphones', quantity: 2, price: 4375 }
    ]
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-18',
    customer: 'Анна Козлова',
    city: 'Алматы',
    channel: 'Web',
    status: 'New',
    total: 32000
  },
  {
    id: 'ORD-2024-005',
    date: '2024-01-19',
    customer: 'Сергей Морозов',
    city: 'Астана',
    channel: 'Mobile',
    status: 'Delivered',
    total: 15600
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Алексей Иванов',
    email: 'alexey.ivanov@example.com',
    city: 'Алматы',
    ltv: 156000,
    ordersCount: 12,
    createdAt: '2023-06-15'
  },
  {
    id: 'CUST-002',
    name: 'Мария Петрова',
    email: 'maria.petrova@example.com',
    city: 'Астана',
    ltv: 89000,
    ordersCount: 8,
    createdAt: '2023-08-22'
  },
  {
    id: 'CUST-003',
    name: 'Дмитрий Сидоров',
    email: 'dmitry.sidorov@example.com',
    city: 'Шымкент',
    ltv: 67500,
    ordersCount: 5,
    createdAt: '2023-11-10'
  },
  {
    id: 'CUST-004',
    name: 'Анна Козлова',
    email: 'anna.kozlova@example.com',
    city: 'Алматы',
    ltv: 145000,
    ordersCount: 15,
    createdAt: '2023-03-07'
  },
  {
    id: 'CUST-005',
    name: 'Сергей Морозов',
    email: 'sergey.morozov@example.com',
    city: 'Астана',
    ltv: 98000,
    ordersCount: 7,
    createdAt: '2023-09-18'
  }
];

// Chart data for dashboard
export const mockChartData = [
  { date: '2024-01-01', revenue: 45000, orders: 12 },
  { date: '2024-01-02', revenue: 52000, orders: 14 },
  { date: '2024-01-03', revenue: 38000, orders: 9 },
  { date: '2024-01-04', revenue: 61000, orders: 18 },
  { date: '2024-01-05', revenue: 43000, orders: 11 },
  { date: '2024-01-06', revenue: 67000, orders: 19 },
  { date: '2024-01-07', revenue: 55000, orders: 16 },
  { date: '2024-01-08', revenue: 49000, orders: 13 },
  { date: '2024-01-09', revenue: 58000, orders: 17 },
  { date: '2024-01-10', revenue: 41000, orders: 10 },
  { date: '2024-01-11', revenue: 63000, orders: 20 },
  { date: '2024-01-12', revenue: 46000, orders: 12 },
  { date: '2024-01-13', revenue: 54000, orders: 15 },
  { date: '2024-01-14', revenue: 59000, orders: 18 }
];

export const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'];
export const channels = ['Web', 'Mobile', 'Offline'];
export const orderStatuses = ['New', 'Processing', 'Shipped', 'Delivered'] as const;