export const bookingStatusLabel: Record<string, string> = {
  PENDING: "Chờ thanh toán cọc",
  APPROVED: "Đã giữ xe",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const carStatusLabel: Record<string, string> = {
  AVAILABLE: "Còn xe",
  UNAVAILABLE: "Đang thuê",
  MAINTENANCE: "Bảo trì",
};

export const customerStatusLabel: Record<string, string> = {
  ACTIVE: "Hoạt động",
  INACTIVE: "Ngừng",
  LOCKED: "Khóa",
};

export const money = (value?: number | null) =>
  value == null ? "—" : `${Number(value).toLocaleString("vi-VN")} đ`;
