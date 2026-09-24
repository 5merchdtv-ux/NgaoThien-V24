import type { NgheData } from "../khicong-data/types";
import { KHICONG_DUNG_CHUNG_V24 } from "./shared";
import { JOB_01_DAO_V24 } from "./job01-dao";
import { JOB_02_KIEM_V24 } from "./job02-kiem";
import { JOB_03_THUONG_V24 } from "./job03-thuong";
import { JOB_04_CUNG_V24 } from "./job04-cung";
import { JOB_05_DAI_PHU_V24 } from "./job05-daiphu";
import { JOB_06_NINJA_V24 } from "./job06-ninja";
import { JOB_07_CAM_SU_V24 } from "./job07-camsu";
import { JOB_08_HAN_BAO_QUAN_V24 } from "./job08-hanbaoquan";
import { JOB_09_DAM_HOA_LIEN_V24 } from "./job09-damhoalien";
import { JOB_10_QUYEN_SU_V24 } from "./job10-quyensu";
import { JOB_11_MAI_LIEU_CHAN_V24 } from "./job11-mailieuchan";
import { JOB_12_TU_HAO_V24 } from "./job12-tuhao";
import { JOB_13_THAN_NU_V24 } from "./job13-thannu";

export type { KhiCongDungChungV24 } from "./shared";
export { KHICONG_DUNG_CHUNG_V24, khiCongDungChungTheoJobV24 } from "./shared";

// Toàn bộ dữ liệu khí công 13 nghề của VER24 — biên soạn 15/09/2026 bằng cách đọc lại
// TRỰC TIẾP code SRCGameServerV24B hiện tại (UpdateKhiCong() trong PlayersBes.cs + các file
// tiêu thụ đã tách partial-class trong Players/), KHÔNG sao chép lại đợt audit 02/09/2026
// dùng cho bộ dữ liệu Ver22 (xem lib/khicong-data/). Một số mục chưa kịp tái xác minh độc lập
// trong đợt này vẫn giữ nội dung audit cũ làm fallback, có ghi chú rõ "[FALLBACK]" trong ghiChu.
// Dữ liệu TĨNH — không gọi Gateway/SQL, build cùng dashboard.
export const KHICONG_DATA_V24: NgheData[] = [
  JOB_01_DAO_V24,
  JOB_02_KIEM_V24,
  JOB_03_THUONG_V24,
  JOB_04_CUNG_V24,
  JOB_05_DAI_PHU_V24,
  JOB_06_NINJA_V24,
  JOB_07_CAM_SU_V24,
  JOB_08_HAN_BAO_QUAN_V24,
  JOB_09_DAM_HOA_LIEN_V24,
  JOB_10_QUYEN_SU_V24,
  JOB_11_MAI_LIEU_CHAN_V24,
  JOB_12_TU_HAO_V24,
  JOB_13_THAN_NU_V24,
];

export function tongSoKhiCongV24(): number {
  return (
    KHICONG_DATA_V24.reduce((sum, nghe) => sum + nghe.khiCong.length, 0) +
    KHICONG_DUNG_CHUNG_V24.length
  );
}
