import { OrderStatus } from '@/types';

const config: Record<OrderStatus, { label: string; className: string }> = {
  paid: { label: 'Payment Locked', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  shipped: { label: 'Shipped', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700 border-green-200' },
  disputed: { label: 'Disputed', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
