import type { NgheData } from "./types";
import { KHICONG_DUNG_CHUNG } from "./shared";
import { JOB_01_DAO } from "./job01-dao";
import { JOB_02_KIEM } from "./job02-kiem";
import { JOB_03_THUONG } from "./job03-thuong";
import { JOB_04_CUNG } from "./job04-cung";
import { JOB_05_DAI_PHU } from "./job05-daiphu";
import { JOB_06_NINJA } from "./job06-ninja";
import { JOB_07_CAM_SU } from "./job07-camsu";
import { JOB_08_HAN_BAO_QUAN } from "./job08-hanbaoquan";
import { JOB_09_DAM_HOA_LIEN } from "./job09-damhoalien";
import { JOB_10_QUYEN_SU } from "./job10-quyensu";
import { JOB_11_MAI_LIEU_CHAN } from "./job11-mailieuchan";
import { JOB_12_TU_HAO } from "./job12-tuhao";
import { JOB_13_THAN_NU } from "./job13-thannu";

export * from "./types";
export { KHICONG_DUNG_CHUNG, khiCongDungChungTheoJob } from "./shared";

// Toàn bộ dữ liệu khí công 13 nghề, biên soạn 09/2026 từ đợt audit khí công 02/09/2026
// (hồ sơ KT-20260902-01) + đọc code bổ sung cho các khí công chưa từng đụng tới trong đợt audit.
// Dữ liệu TĨNH — không gọi Gateway/SQL, build cùng dashboard.
export const KHICONG_DATA: NgheData[] = [
  JOB_01_DAO,
  JOB_02_KIEM,
  JOB_03_THUONG,
  JOB_04_CUNG,
  JOB_05_DAI_PHU,
  JOB_06_NINJA,
  JOB_07_CAM_SU,
  JOB_08_HAN_BAO_QUAN,
  JOB_09_DAM_HOA_LIEN,
  JOB_10_QUYEN_SU,
  JOB_11_MAI_LIEU_CHAN,
  JOB_12_TU_HAO,
  JOB_13_THAN_NU,
];

export function tongSoKhiCong(): number {
  return (
    KHICONG_DATA.reduce((sum, nghe) => sum + nghe.khiCong.length, 0) +
    KHICONG_DUNG_CHUNG.length
  );
}
