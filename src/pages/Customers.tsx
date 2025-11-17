import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Users, Mail, MapPin, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cities, Customer, Order } from "@/lib/mockData";

export default function Customers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers', search, selectedCity],
    queryFn: () => api.getCustomers(search, selectedCity),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.id],
    queryFn: () => selectedCustomer ? api.getCustomerOrders(selectedCustomer.id) : null,
    enabled: !!selectedCustomer,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getLoyaltyLevel = (ltv: number) => {
    if (ltv >= 150000) return { level: 'Platinum', variant: 'default' as const };
    if (ltv >= 100000) return { level: 'Gold', variant: 'secondary' as const };
    if (ltv >= 50000) return { level: 'Silver', variant: 'outline' as const };
    return { level: 'Bronze', variant: 'destructive' as const };
  };

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
              <SelectItem value="">All cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
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
          customers?.map((customer) => {
            const loyalty = getLoyaltyLevel(customer.ltv);
            return (
              <Dialog key={customer.id}>
                <DialogTrigger asChild>
                  <Card 
                    className="cursor-pointer hover:shadow-elevated transition-shadow"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">{customer.name}</CardTitle>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                        <Badge variant={loyalty.variant}>
                          {loyalty.level}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.city}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">LTV</span>
                          <span className="font-medium">{formatCurrency(customer.ltv)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">{t('customers.orders_count')}</span>
                          <span className="font-medium">{customer.ordersCount}</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Customer since {formatDate(customer.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {customer.name}
                    </DialogTitle>
                    <DialogDescription>
                      Customer details and order history
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-lg font-bold">{customer.city}</div>
                          <div className="text-sm text-muted-foreground">Location</div>
                        </div>
                      </Card>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="font-semibold mb-4">Recent Orders</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {customerOrders?.map((order: Order) => (
                          <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <div className="font-medium text-sm">{order.id}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(order.date)} • {order.channel}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(order.total)}</div>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        {(!customerOrders || customerOrders.length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            No orders found
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

      {!isLoading && customers && customers.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No customers found</h3>
          <p className="text-muted-foreground">
            {search || selectedCity 
              ? "Try adjusting your search criteria" 
              : "No customers available"
            }
          </p>
        </Card>
      )}
    </div>
  );
}