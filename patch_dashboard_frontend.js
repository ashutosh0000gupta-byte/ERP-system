const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard/AdminDashboard.jsx', 'utf8');

if (!code.includes('Total Salaries Paid')) {
  code = code.replace(
    '<KpiCard \n            title="Total Advance" \n            value={`₹${Number(stats.totalAdvance).toLocaleString()}`} \n            subtitle="Outstanding balance to deduct"\n            icon={IndianRupee} \n            color="#ef4444" \n          />',
    `<KpiCard 
            title="Total Advance" 
            value={\`₹\${Number(stats.totalAdvance).toLocaleString()}\`} 
            subtitle="Outstanding balance to deduct"
            icon={IndianRupee} 
            color="#ef4444" 
          />
          <KpiCard 
            title="Total Salaries Paid" 
            value={\`₹\${Number(stats.totalSalaries || 0).toLocaleString()}\`} 
            subtitle="Cleared wage payments"
            icon={IndianRupee} 
            color="#10b981" 
          />
          <KpiCard 
            title="Total Site Expenses" 
            value={\`₹\${Number(stats.totalExpenses || 0).toLocaleString()}\`} 
            subtitle="Material & operational costs"
            icon={TrendingUp} 
            color="#f59e0b" 
          />`
  );
  
  code = code.replace(
    'totalAdvance: 0,',
    'totalAdvance: 0,\n    totalSalaries: 0,\n    totalExpenses: 0,'
  );

  fs.writeFileSync('frontend/src/pages/Dashboard/AdminDashboard.jsx', code);
}
