import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Users, Mail, MapPin, TrendingUp, DollarSign, UserPlus, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from "@/lib/api";
import { cities, Customer, Order } from "@/lib/mockData";

type SortField = 'name' | 'ltv' | 'ordersCount' | 'city' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function Customers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortField, setSortField] = useState<SortField>('ltv');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', search, selectedCity],
    queryFn: () => api.getCustomers(search, selectedCity === 'all' ? '' : selectedCity),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.id],
    queryFn: () => selectedCustomer ? api.getCustomerOrders(selectedCustomer.id) : null,
    enabled: !!selectedCustomer,
  });

  // Calculate statistics
  const stats = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {
        total: 0,
        totalLTV: 0,
        averageLTV: 0,
        activeCustomers: 0,
        cityDistribution: []
      };
    }

    const totalLTV = customers.reduce((sum, c) => sum + c.ltv, 0);
    const averageLTV = totalLTV / customers.length;
    const activeCustomers = customers.filter(c => c.ordersCount > 0).length;

    // City distribution
    const cityMap = new Map<string, number>();
    customers.forEach(customer => {
      cityMap.set(customer.city, (cityMap.get(customer.city) || 0) + 1);
    });
    const cityDistribution = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total: customers.length,
      totalLTV,
      averageLTV,
      activeCustomers,
      cityDistribution
    };
  }, [customers]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    if (!customers) return [];
    
    const sorted = [...customers].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'name') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return sorted;
  }, [customers, sortField, sortOrder]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getLoyaltyLevel = (ltv: number) => {
    if (ltv >= 150000) return { level: 'Platinum', variant: 'default' as const, color: 'bg-purple-500' };
    if (ltv >= 100000) return { level: 'Gold', variant: 'secondary' as const, color: 'bg-yellow-500' };
    if (ltv >= 50000) return { level: 'Silver', variant: 'outline' as const, color: 'bg-gray-400' };
    return { level: 'Bronze', variant: 'destructive' as const, color: 'bg-orange-500' };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const COLORS = ['hsl(var(--primary))', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-destructive">Error loading customers</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('customers.title')}</h1>
          <p className="text-muted-foreground">
            Manage customer relationships and track their lifetime value
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))
        ) : (
          <>
            <MetricCard
              title="Total Customers"
              value={stats.total.toString()}
              change={{ value: 12.5, label: "from last month" }}
              icon={Users}
            />
            <MetricCard
              title="Total LTV"
              value={formatCurrency(stats.totalLTV)}
              change={{ value: 8.2, label: "from last month" }}
              icon={DollarSign}
            />
            <MetricCard
              title="Average LTV"
              value={formatCurrency(stats.averageLTV)}
              change={{ value: 5.1, label: "from last month" }}
              icon={TrendingUp}
            />
            <MetricCard
              title="Active Customers"
              value={stats.activeCustomers.toString()}
              change={{ value: 15.3, label: "from last month" }}
              icon={UserPlus}
            />
          </>
        )}
      </div>

      {/* City Distribution Chart */}
      {!isLoading && stats.cityDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Customer Distribution by City
            </CardTitle>
            <CardDescription>
              Number of customers in each city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="city" 
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <div className="font-bold">{payload[0].payload.city}</div>
                            <div className="text-sm text-muted-foreground">
                              Customers: {payload[0].value}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {stats.cityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('customers.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-') as [SortField, SortOrder];
            setSortField(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ltv-desc">LTV: High to Low</SelectItem>
              <SelectItem value="ltv-asc">LTV: Low to High</SelectItem>
              <SelectItem value="ordersCount-desc">Orders: High to Low</SelectItem>
              <SelectItem value="ordersCount-asc">Orders: Low to High</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          sortedCustomers?.map((customer) => {
            const loyalty = getLoyaltyLevel(customer.ltv);
            return (
              <Dialog key={customer.id}>
                <DialogTrigger asChild>
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4"
                    style={{ borderLeftColor: loyalty.color.replace('bg-', '') }}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold">{customer.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[150px]">{customer.email}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={loyalty.variant} className="ml-2">
                          {loyalty.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.city}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">Lifetime Value</span>
                          <span className="font-semibold text-lg">{formatCurrency(customer.ltv)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">{t('customers.orders_count')}</span>
                          <span className="font-semibold text-lg">{customer.ordersCount}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Customer since {formatDate(customer.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      {customer.name}
                    </DialogTitle>
                    <DialogDescription>
                      Detailed customer information and order history
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Customer Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">{formatCurrency(customer.ltv)}</div>
                          <div className="text-sm text-muted-foreground">Lifetime Value</div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">{customer.ordersCount}</div>
                          <div className="text-sm text-muted-foreground">Total Orders</div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-2xl font-bold">
                            {formatCurrency(customer.ordersCount > 0 ? customer.ltv / customer.ordersCount : 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Avg Order Value</div>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-lg font-bold">{customer.city}</div>
                          <div className="text-sm text-muted-foreground">Location</div>
                        </div>
                      </Card>
                    </div>

                    {/* Contact Information */}
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Member since {formatDate(customer.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={loyalty.variant}>{loyalty.level} Member</Badge>
                        </div>
                      </div>
                    </Card>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="font-semibold mb-4">Order History</h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {customerOrders && customerOrders.length > 0 ? (
                          customerOrders.map((order: Order) => (
                            <Card key={order.id} className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-sm">{order.id}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <div>{formatDate(order.date)}</div>
                                    <div>Channel: {order.channel}</div>
                                    {order.items && (
                                      <div className="mt-2">
                                        <div className="font-medium text-foreground mb-1">Items:</div>
                                        {order.items.map((item) => (
                                          <div key={item.id} className="pl-2">
                                            {item.name} × {item.quantity} - {formatCurrency(item.price)}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {order.comment && (
                                      <div className="mt-2 italic">Note: {order.comment}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-bold text-lg">{formatCurrency(order.total)}</div>
                                </div>
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No orders found for this customer</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          })
        )}
      </div>

      {!isLoading && sortedCustomers && sortedCustomers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground">
            {search || selectedCity !== 'all'
              ? "Try adjusting your search criteria" 
              : "No customers available"
            }
          </p>
        </Card>
      )}
    </div>
  );
}
