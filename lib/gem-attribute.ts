/**
 * Giải mã thuộc tính của Ngọc từ trường MAGIC0.
 *
 * Ngọc KHÔNG dùng chung cách mã hóa với trang bị. Với trang bị, MAGIC0 dài 8–10 chữ số và
 * 2 chữ số cuối là mức cường hóa. Với ngọc, MAGIC0 dài **6 chữ số**:
 *
 *     [1 chữ số loại thuộc tính][5 chữ số giá trị]
 *
 * Đối chiếu dữ liệu thật trong `TBL_XWWL_DROP`:
 *
 *     200012 -> loại 2 (Sức phòng ngự), giá trị 12   (Hàn Ngọc Thạch, PID 800000062)
 *     100020 -> loại 1 (Sức tấn công),  giá trị 20   (PID 800000061)
 *     300200 -> loại 3 (Sinh mệnh HP),  giá trị 200
 *
 * Trước đây web áp công thức của trang bị cho ngọc nên lấy 2 chữ số cuối của `200012` ra `12`
 * rồi hiển thị nhầm thành "Cường hóa +12", đồng thời báo "0 dòng thuộc tính".
 * Game hiển thị đúng là "[Lực phòng ngự + 12]".
 */

export type GemAttribute = {
  /** Mã loại thuộc tính, tra trong ATTRIBUTE_NAMES. */
  type: number;
  value: number;
};

/** Số chữ số của MAGIC0 khi vật phẩm là ngọc. */
const GEM_MAGIC0_LENGTH = 6;

/**
 * Trả về thuộc tính của ngọc, hoặc null nếu vật phẩm không phải ngọc.
 *
 * Kiểm độ dài đúng 6 chữ số để không nhận nhầm trang bị (8–10 chữ số) — nhận nhầm sẽ làm
 * hỏng hiển thị cường hóa của trang bị.
 */
export function decodeGemMagic0(magic0: number | null | undefined): GemAttribute | null {
  if (!magic0 || magic0 <= 0) return null;
  const digits = String(magic0);
  if (digits.length !== GEM_MAGIC0_LENGTH) return null;

  const type = Number(digits.slice(0, 1));
  const value = Number(digits.slice(1));
  if (!Number.isFinite(type) || !Number.isFinite(value)) return null;
  if (type <= 0 || value <= 0) return null;

  return { type, value };
}

/** Vật phẩm có phải ngọc không. Dùng để ẩn ô "Cường hóa" vốn vô nghĩa với ngọc. */
export function isGemItem(magic0: number | null | undefined): boolean {
  return decodeGemMagic0(magic0) !== null;
}
