import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, ChevronUp, ChevronDown, MoreHorizontal, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Order, orderStatuses } from "@/lib/mockData";

type SortField = 'date' | 'customer' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';

export default function Orders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', page, search, sortField, sortOrder],
    queryFn: () => api.getOrders(page, 10, search, sortField, sortOrder),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      api.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating the order status",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'New':
        return 'secondary';
      case 'Processing':
        return 'default';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-destructive">Error loading orders</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('orders.title')}</h1>
          <p className="text-muted-foreground">
            Manage and track all orders
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('orders.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-2">
                  {t('orders.date')}
                  <SortIcon field="date" />
                </div>
              </TableHead>
              <TableHead>{t('orders.id')}</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('customer')}
              >
                <div className="flex items-center gap-2">
                  {t('orders.customer')}
                  <SortIcon field="customer" />
                </div>
              </TableHead>
              <TableHead>{t('dashboard.city')}</TableHead>
              <TableHead>{t('dashboard.channel')}</TableHead>
              <TableHead 
                className="cursor-pointer select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  {t('orders.status')}
                  <SortIcon field="status" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer select-none text-right"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center justify-end gap-2">
                  {t('orders.total')}
                  <SortIcon field="total" />
                </div>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              data?.orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell className="font-medium">{order.customer}</TableCell>
                  <TableCell>{order.city}</TableCell>
                  <TableCell>{order.channel}</TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order['status']) => 
                        handleStatusUpdate(order.id, value)
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <Badge variant={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            <Badge variant={getStatusVariant(status)}>
                              {status}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{t('orders.details')}</DialogTitle>
                          <DialogDescription>
                            Order {order.id}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Customer:</span>
                              <p>{order.customer}</p>
                            </div>
                            <div>
                              <span className="font-medium">Date:</span>
                              <p>{formatDate(order.date)}</p>
                            </div>
                            <div>
                              <span className="font-medium">City:</span>
                              <p>{order.city}</p>
                            </div>
                            <div>
                              <span className="font-medium">Channel:</span>
                              <p>{order.channel}</p>
                            </div>
                          </div>
                          
                          {order.items && (
                            <div>
                              <span className="font-medium text-sm">Order Items:</span>
                              <div className="mt-2 space-y-2">
                                {order.items.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} x{item.quantity}</span>
                                    <span>{formatCurrency(item.price)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {order.comment && (
                            <div>
                              <span className="font-medium text-sm">Comment:</span>
                              <p className="text-sm text-muted-foreground mt-1">{order.comment}</p>
                            </div>
                          )}
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total} orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}