import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShoppingCart, DollarSign, Target, Filter, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { api } from "@/lib/api";
import { DashboardFilters } from "@/lib/mockData";
import { cities, channels } from "@/lib/mockData";

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [filters, setFilters] = useState<DashboardFilters>({
    period: '30d',
    channel: undefined,
    city: undefined,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => api.getDashboardData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1) + '%';
  };

  const handleExport = async () => {
    try {
      if (!data?.chartData) return;
      
      const csvContent = await api.exportToCsv(data.chartData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Dashboard data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export failed", 
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    }
  };

  const applyFilters = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center">
          <p className="text-destructive">Error loading dashboard data</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            Overview of your business metrics and performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                {t('dashboard.filters')}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{t('dashboard.filters')}</SheetTitle>
                <SheetDescription>
                  Apply filters to customize your dashboard view
                </SheetDescription>
              </SheetHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dashboard.period')}</label>
                  <Select 
                    value={filters.period} 
                    onValueChange={(value: DashboardFilters['period']) => 
                      applyFilters({ period: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="QTD">Quarter to date</SelectItem>
                      <SelectItem value="YTD">Year to date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dashboard.channel')}</label>
                  <Select 
                    value={filters.channel} 
                    onValueChange={(value) => 
                      applyFilters({ channel: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All channels</SelectItem>
                      {channels.map(channel => (
                        <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('dashboard.city')}</label>
                  <Select 
                    value={filters.city} 
                    onValueChange={(value) => 
                      applyFilters({ city: value === 'all' ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Button onClick={handleExport} size="sm" disabled={!data}>
            <Download className="mr-2 h-4 w-4" />
            {t('dashboard.export')}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
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
              title={t('dashboard.revenue')}
              value={formatCurrency(data?.metrics.revenue || 0)}
              change={{ value: 12.5, label: "from last period" }}
              icon={DollarSign}
            />
            <MetricCard
              title={t('dashboard.orders')}
              value={data?.metrics.orders.toString() || '0'}
              change={{ value: 8.2, label: "from last period" }}
              icon={ShoppingCart}
            />
            <MetricCard
              title={t('dashboard.aov')}
              value={formatCurrency(data?.metrics.aov || 0)}
              change={{ value: -2.1, label: "from last period" }}
              icon={TrendingUp}
            />
            <MetricCard
              title={t('dashboard.conversion')}
              value={formatPercentage(data?.metrics.conversionRate || 0)}
              change={{ value: 4.7, label: "from last period" }}
              icon={Target}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <Card className="col-span-2 p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </Card>
        ) : (
          <RevenueChart data={data?.chartData || []} />
        )}
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Cities</h3>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Алматы</span>
                  <span className="text-sm font-medium">156K ₸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Астана</span>
                  <span className="text-sm font-medium">124K ₸</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Шымкент</span>
                  <span className="text-sm font-medium">89K ₸</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}