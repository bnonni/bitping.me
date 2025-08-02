// app/components/AlertCard.tsx
import React from 'react';
import { Alert } from '@/prisma/generated';

type AlertCardProps = {
  data: {
    expired: Boolean;
    alert: Alert
  }
};

/**
 * AlertCard component displays the details of an alert.
 * @param {AlertCardProps} props - The properties for the AlertCard component.
 * @returns {React.JSX.Element} - The rendered AlertCard component.
 */
export default function AlertCard(props: AlertCardProps): React.JSX.Element {
  const {
    createdAt,
    alertType,
    triggerLogic,
    triggerPrice,
    sent,
  } = props.data.alert;
  return (
    <>
      <div className="grid grid-cols-4">
        <div>
          <p className="font-bold">Date</p>
          {new Date(createdAt).toLocaleDateString()}
        </div>
        <div className="border-x border-gray-700">
          <p className="font-bold">Type</p>
          {alertType?.toUpperCase()}
        </div>
        <div className="border-r border-gray-700">
          <p className="font-bold">Trigger</p>
          {triggerLogic === 'above' ? '≥' : '≤'} ${Number(triggerPrice).toLocaleString()}
        </div>
        <div>
          <p className="font-bold">Sent</p>
          {sent ? '✅' : '❌'}
        </div>
      </div>
      <hr className="border-gray-700" />
    </>
  );
}