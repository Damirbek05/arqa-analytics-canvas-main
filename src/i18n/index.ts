import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.orders': 'Orders',
      'nav.customers': 'Customers',
      'nav.settings': 'Settings',
      
      // Dashboard
      'dashboard.title': 'Analytics Dashboard',
      'dashboard.revenue': 'Revenue',
      'dashboard.orders': 'Orders',
      'dashboard.aov': 'AOV',
      'dashboard.conversion': 'Conversion Rate',
      'dashboard.filters': 'Filters',
      'dashboard.export': 'Export CSV',
      'dashboard.period': 'Period',
      'dashboard.channel': 'Channel',
      'dashboard.city': 'City',
      
      // Orders
      'orders.title': 'Orders',
      'orders.search': 'Search orders...',
      'orders.id': 'Order ID',
      'orders.date': 'Date',
      'orders.customer': 'Customer',
      'orders.status': 'Status',
      'orders.total': 'Total',
      'orders.details': 'Order Details',
      
      // Customers  
      'customers.title': 'Customers',
      'customers.search': 'Search customers...',
      'customers.name': 'Name',
      'customers.email': 'Email',
      'customers.ltv': 'LTV',
      'customers.orders_count': 'Orders',
      
      // Settings
      'settings.title': 'Settings',
      'settings.theme': 'Theme',
      'settings.language': 'Language',
      'settings.light': 'Light',
      'settings.dark': 'Dark',
      
      // Common
      'common.apply': 'Apply',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.close': 'Close',
    }
  },
  ru: {
    translation: {
      // Navigation
      'nav.dashboard': 'Дашборд',
      'nav.orders': 'Заказы',
      'nav.customers': 'Клиенты',
      'nav.settings': 'Настройки',
      
      // Dashboard
      'dashboard.title': 'Аналитический дашборд',
      'dashboard.revenue': 'Выручка',
      'dashboard.orders': 'Заказы',
      'dashboard.aov': 'Средний чек',
      'dashboard.conversion': 'Конверсия',
      'dashboard.filters': 'Фильтры',
      'dashboard.export': 'Экспорт CSV',
      'dashboard.period': 'Период',
      'dashboard.channel': 'Канал',
      'dashboard.city': 'Город',
      
      // Orders
      'orders.title': 'Заказы',
      'orders.search': 'Поиск заказов...',
      'orders.id': 'ID заказа',
      'orders.date': 'Дата',
      'orders.customer': 'Клиент',
      'orders.status': 'Статус',
      'orders.total': 'Сумма',
      'orders.details': 'Детали заказа',
      
      // Customers
      'customers.title': 'Клиенты',
      'customers.search': 'Поиск клиентов...',
      'customers.name': 'Имя',
      'customers.email': 'Email',
      'customers.ltv': 'LTV',
      'customers.orders_count': 'Заказов',
      
      // Settings
      'settings.title': 'Настройки',
      'settings.theme': 'Тема',
      'settings.language': 'Язык',
      'settings.light': 'Светлая',
      'settings.dark': 'Тёмная',
      
      // Common
      'common.apply': 'Применить',
      'common.cancel': 'Отмена',
      'common.save': 'Сохранить',
      'common.close': 'Закрыть',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;