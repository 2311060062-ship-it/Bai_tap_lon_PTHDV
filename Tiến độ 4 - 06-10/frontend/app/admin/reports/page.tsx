"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { bookingStatusLabel, money } from "@/lib/labels";
import { paymentMethodLabel, paymentStatusLabel } from "@/lib/payment";
import type { Payment, RevenueReport } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  APPROVED: "#2D5BFF",
  COMPLETED: "#16A34A",
  CANCELLED: "#94A3B8",
};

function BarChart({ points }: { points: { label: string; revenue: number; bookings: number }[] }) {
  const max = Math.max(...points.map((p) => p.revenue), 1);
  return (
    <div className="flex h-64 items-end gap-3 px-2">
      {points.map((point) => {
        const h = Math.max(8, Math.round((point.revenue / max) * 200));
        return (
          <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
            <p className="text-[10px] font-semibold text-slate-500">{point.revenue ? money(point.revenue) : ""}</p>
            <div
              className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-[#1E40AF] to-[#2D5BFF] shadow-sm"
              style={{ height: h }}
              title={`${point.label}: ${money(point.revenue)} • ${point.bookings} đơn`}
            />
            <p className="text-xs font-medium text-slate-600">{point.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ items }: { items: { name: string; value: number; color: string }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let acc = 0;
  const stops = items.map((item) => {
    const start = (acc / total) * 100;
    acc += item.value;
    const end = (acc / total) * 100;
    return `${item.color} ${start}% ${end}%`;
  });
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div
        className="relative h-40 w-40 rounded-full"
        style={{ background: `conic-gradient(${stops.join(",")})` }}
      >
        <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
          <p className="text-2xl font-black text-slate-900">{items.reduce((s, i) => s + i.value, 0)}</p>
          <p className="text-[11px] text-slate-400">đơn</p>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600">{bookingStatusLabel[item.name] || item.name}</span>
            <span className="ml-auto font-semibold text-slate-900">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/api/admin/reports"), api.get("/api/payments")])
      .then(([reportRes, paymentRes]) => {
        setReport(reportRes.data);
        setPayments(paymentRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không tải được báo cáo"));
  }, []);

  const statusItems = useMemo(
    () =>
      (report?.byStatus || []).map((item) => ({
        name: item.name,
        value: item.value,
        color: STATUS_COLORS[item.name] || "#94A3B8",
      })),
    [report]
  );

  const carMax = Math.max(...(report?.byCar || []).map((item) => item.value), 1);

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!report) return <p>Đang tải báo cáo doanh thu...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Báo cáo doanh thu</h1>
      <p className="mt-1 text-sm text-slate-500">Theo dõi tiền đã thu, còn phải thu và cơ cấu đơn đặt xe.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tổng doanh thu", money(report.totalRevenue), "Đã thanh toán"],
          ["Doanh thu tháng này", money(report.monthRevenue), "Theo ngày thanh toán"],
          ["Còn phải thu", money(report.remainingReceivable), "Đơn chưa trả đủ"],
          ["Số giao dịch", report.paidTransactions, "Lượt thanh toán thành công"],
        ].map(([label, value, hint]) => (
          <div key={String(label)} className="rounded-2xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Doanh thu 6 tháng gần nhất</h2>
          <p className="mt-1 text-xs text-slate-400">Cột càng cao thì tháng đó thu được nhiều hơn.</p>
          <div className="mt-4">
            <BarChart points={report.months} />
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Cơ cấu đơn đặt xe</h2>
          <div className="mt-4">
            <Donut items={statusItems} />
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Doanh thu theo xe</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Xe</th>
                <th className="pb-2 font-medium">Doanh thu</th>
                <th className="pb-2 font-medium">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody>
              {report.byCar.map((item) => (
                <tr key={item.name} className="border-t">
                  <td className="py-3 font-medium text-slate-800">{item.name}</td>
                  <td>{money(item.value)}</td>
                  <td className="w-40">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#2D5BFF]" style={{ width: `${Math.round((item.value / carMax) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
              {!report.byCar.length && (
                <tr><td colSpan={3} className="py-6 text-center text-slate-400">Chưa có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Theo phương thức thanh toán</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2 font-medium">Phương thức</th>
                <th className="pb-2 font-medium">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {report.byMethod.map((item) => (
                <tr key={item.name} className="border-t">
                  <td className="py-3">{paymentMethodLabel[item.name] || item.name}</td>
                  <td className="font-semibold">{money(item.value)}</td>
                </tr>
              ))}
              {!report.byMethod.length && (
                <tr><td colSpan={2} className="py-6 text-center text-slate-400">Chưa có giao dịch.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Bảng giao dịch đã thu</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="font-medium">Đơn</th>
              <th className="font-medium">Khách</th>
              <th className="font-medium">Xe</th>
              <th className="font-medium">Số tiền</th>
              <th className="font-medium">Hình thức</th>
              <th className="font-medium">Trạng thái</th>
              <th className="px-4 font-medium">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((item) => (
              <tr key={item.paymentId} className="border-t">
                <td className="px-4 py-3">#{item.paymentId}</td>
                <td>#{item.bookingId}</td>
                <td>{item.customerName || "—"}</td>
                <td>{item.carName || "—"}</td>
                <td className="font-semibold">{money(item.amount)}</td>
                <td>{paymentMethodLabel[item.paymentMethod] || item.paymentMethod}</td>
                <td>{paymentStatusLabel[item.status] || item.status}</td>
                <td className="px-4">{item.paymentDate ? new Date(item.paymentDate).toLocaleString("vi-VN") : "—"}</td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">Chưa có giao dịch thanh toán.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
