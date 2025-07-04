import React from "react";
import Card from "../ui/Card";

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View business analytics and reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Monthly Summary
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Overview of this month's activities
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Coming Soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Customer Analytics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Customer behavior and trends
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Coming Soon</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Payment Insights
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Payment patterns and analysis
          </p>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Coming Soon</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
