# HKNT GM Control Center

Trang quản trị nội bộ dành cho HK Ngạo Thiên, chạy trên Vercel và chỉ mở sau khi đăng nhập quản trị.

## Chức năng

- Tổng quan trạng thái Login Server, Game Server, Launcher Gate và số người chơi online.
- Danh sách bảng xếp hạng và lịch sử cường hóa.
- Kết nối GM lần hai bằng tài khoản game có quyền GM/Admin; mật khẩu GM không được lưu.
- Tra cứu nhân vật online, chỉnh các chỉ số được phép, gửi vật phẩm cơ bản, kick/khóa nhân vật theo quyền.
- Các nhóm Voucher, Server, Rate/EXP, Shop và tin Launcher được khóa sẵn cho tới khi VPS có Admin Gateway an toàn.

## Bảo mật

- Toàn bộ trang và API quản trị yêu cầu phiên đăng nhập `HttpOnly`.
- Các thao tác thay đổi dữ liệu đi qua API phía máy chủ; trình duyệt không nhận token GM.
- Chặn yêu cầu thay đổi dữ liệu từ website khác, giới hạn trường và giá trị đầu vào.
- Thao tác kick/khóa yêu cầu quyền Admin và nhập đúng tên nhân vật để xác nhận.
- Không có chức năng chạy lệnh hệ thống, PowerShell hay SQL tùy ý từ trình duyệt.
- Dữ liệu công khai được cache ngắn tại Vercel để giảm tải VPS.

## Giao diện

Giao diện sử dụng artwork HKNT có sẵn trong dự án, tông tối-vàng, chữ hệ thống cỡ rõ ràng và hỗ trợ màn hình điện thoại.

## Biến môi trường

Sao chép `.env.example` thành `.env.local` khi chạy nội bộ và điền:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`
- `API_BASE_URL`

Phiên đăng nhập quản trị tự hết hạn sau 8 giờ; phiên kết nối GM tối đa 1 giờ.
