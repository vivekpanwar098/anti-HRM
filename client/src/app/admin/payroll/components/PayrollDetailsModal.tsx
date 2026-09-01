"use client";

import { X } from "lucide-react";
import type { PayrollDetail } from "@/features/admin/services/payroll.service";

type PayrollDetailsModalProps = {
  data: PayrollDetail | null;
  onClose: () => void;
};

const currency = (v: number | null | undefined) =>
  v == null ? "—" : `₹ ${v.toLocaleString("en-IN")}`;

export default function PayrollDetailsModal({ data, onClose }: PayrollDetailsModalProps) {
  
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Payroll Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{data.employeeName}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {data.department} Department &bull; {data.designation}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Joining Date: {new Date(data.joiningDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled: {data.scheduledWorkingDays}d · Worked: {data.workedDays}d · Paid leave:{" "}
              {data.paidLeaveDays}d · Unpaid: {data.unpaidLeaveDays}d
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Earnings</h4>
              <div className="space-y-2 text-sm">
                {data.earnings.map((item) => (
                  <div key={item.label} className="flex justify-between text-slate-600">
                    <span>{item.label}</span>
                    <span className="font-medium text-slate-800">{currency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-[#18A096]">
                <span>Total Earnings</span>
                <span>{currency(data.totalEarnings)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800">Deductions</h4>
              <div className="space-y-2 text-sm">
                {data.deductionsBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-slate-600">
                    <span>{item.label}</span>
                    <span className="font-medium text-slate-800">{currency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100 font-bold text-rose-500">
                <span>Total Deductions</span>
                <span>{currency(data.totalDeductions)}</span>
              </div>
            </div>
          </div>

          <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Gross Salary</span>
              <span className="font-medium text-slate-800">{currency(data.totalEarnings)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Total Deductions</span>
              <span className="font-medium text-rose-500">- {currency(data.totalDeductions)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-teal-200/60 font-bold text-lg text-slate-800">
              <span>Net Salary</span>
              <span className="text-[#18A096] text-xl">{currency(data.netSalary)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}