import OrderStatusClient from './OrderStatusClient';

export function generateStaticParams() {
  // Order numbers are dynamic, so we generate no static pages
  // The page will be rendered client-side
  return [{ orderNumber: 'placeholder' }];
}

export default function OrderStatusPage() {
  return <OrderStatusClient />;
}
