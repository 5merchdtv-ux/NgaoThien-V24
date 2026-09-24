/**
 * Sửa tên vật phẩm bị hỏng dấu tiếng Việt.
 *
 * Khoảng 5.753/12.555 dòng trong `TBL_XWWL_ITEM` lưu tên ở dạng mã cũ: chữ cái gốc bị thay
 * và dấu thanh tách thành một ký tự riêng đứng NGAY SAU nguyên âm. Ví dụ thật trong database:
 *
 *   Baòch    -> Bạch      (a + ò = nặng)
 *   ngaÌy    -> ngày      (a + Ì = huyền)
 *   ThoÒ     -> Thỏ       (o + Ò = hỏi)
 *   voÞ      -> võ        (o + Þ = ngã)
 *   trãìng   -> trắng     (ã=ă, rồi ă + ì = sắc)
 *   sýÒa     -> sửa       (ý=ư, rồi ư + Ò = hỏi)
 *
 * CHỈ dùng để hiển thị. KHÔNG sửa ngược vào database vì chưa xác minh được game đọc tên
 * từ đâu; sửa 5.753 dòng mà sai là hỏng hiển thị trong game.
 */

/** Chữ cái gốc bị thay bằng ký tự khác. */
const BASE_MAP: Record<string, string> = {
  ý: "ư",
  Ý: "Ư",
  õ: "ơ",
  Õ: "Ơ",
  ã: "ă",
  Ã: "Ă",
  ð: "đ",
  Ð: "Đ",
};

/** Dấu thanh đứng sau nguyên âm, đổi sang ký tự dấu kết hợp của Unicode. */
const TONE_MAP: Record<string, string> = {
  "ì": "́", // sắc
  "Ì": "̀", // huyền
  "Ò": "̉", // hỏi
  "Þ": "̃", // ngã
  "ò": "̣", // nặng
};

const VOWELS = "aăâeêioôơuưyAĂÂEÊIOÔƠUƯY";

/**
 * Nhận biết tên có bị hỏng mã hay không.
 *
 * Phải chặt tay: gần một nửa số vật phẩm lưu tên Unicode ĐÚNG, đem chuyển nhầm sẽ làm hỏng
 * tên đang tốt. Hai dấu hiệu dùng ở đây:
 *  - Có ký tự `Ì Ò Þ ð Ð`: gần như không xuất hiện trong tiếng Việt viết đúng.
 *  - Có nguyên âm đứng ngay trước `ì` hoặc `ò`: tiếng Việt đúng không viết như vậy.
 */
export function isBrokenVietnamese(text: string): boolean {
  if (!text) return false;
  if (/[ÌÒÞðÐ]/.test(text)) return true;
  return new RegExp(`[${VOWELS}][ìò]`).test(text);
}

/** Chuyển tên hỏng mã về tiếng Việt đúng. Tên đã đúng thì giữ nguyên. */
export function fixVietnameseName(text: string): string {
  if (!text || !isBrokenVietnamese(text)) return text;

  let out = "";
  for (const char of text) {
    const tone = TONE_MAP[char];
    if (tone) {
      // Dấu thanh chỉ có nghĩa khi đứng sau một nguyên âm.
      const previous = out.slice(-1);
      if (previous && VOWELS.includes(previous)) {
        out += tone;
        continue;
      }
      // Không có nguyên âm phía trước thì đây là ký tự thật, giữ nguyên.
      out += char;
      continue;
    }
    out += BASE_MAP[char] ?? char;
  }

  // Ghép nguyên âm với dấu kết hợp thành ký tự tiếng Việt hoàn chỉnh.
  return out.normalize("NFC");
}
