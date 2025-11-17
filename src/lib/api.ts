import { mockOrders, mockCustomers, mockChartData, Order, Customer, DashboardFilters } from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Dashboard
  async getDashboardData(filters: DashboardFilters) {
    await delay(500);
    
    // Filter orders based on filters
    let filteredOrders = [...mockOrders];
    
    if (filters.channel) {
      filteredOrders = filteredOrders.filter(order => order.channel === filters.channel);
    }
    
    if (filters.city) {
      filteredOrders = filteredOrders.filter(order => order.city === filters.city);
    }
    
    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = 0.034; // Mock conversion rate
    
    return {
      metrics: {
        revenue: totalRevenue,
        orders: totalOrders,
        aov: Math.round(aov),
        conversionRate: conversionRate
      },
      chartData: mockChartData
    };
  },

  // Orders
  async getOrders(page = 1, limit = 10, search = '', sortBy = 'date', sortOrder: 'asc' | 'desc' = 'desc') {
    await delay(300);
    
    let filteredOrders = [...mockOrders];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.city.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort orders
    filteredOrders.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'total') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
    
    return {
      orders: paginatedOrders,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      currentPage: page
    };
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(200);
    return mockOrders.find(order => order.id === id) || null;
  },

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    await delay(300);
    const order = mockOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  },

  // Customers
  async getCustomers(search = '', city = '') {
    await delay(400);
    
    let filteredCustomers = [...mockCustomers];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (city) {
      filteredCustomers = filteredCustomers.filter(customer => customer.city === city);
    }
    
    return filteredCustomers;
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    await delay(200);
    return mockCustomers.find(customer => customer.id === id) || null;
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    await delay(300);
    const customer = mockCustomers.find(c => c.id === customerId);
    if (!customer) return [];
    
    return mockOrders.filter(order => order.customer === customer.name);
  },

  // Export
  async exportToCsv(data: any[]) {
    await delay(100);
    
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
};