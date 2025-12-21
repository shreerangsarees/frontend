import React from 'react';
import AdminLayout from './AdminLayout';

const AdminAnalytics: React.FC = () => {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display">Analytics</h1>
        <p className="text-muted-foreground">Detailed reports and statistics</p>
      </div>
      <div className="p-8 text-center bg-card rounded-xl border border-border">
        <p>Analytics module coming soon.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
