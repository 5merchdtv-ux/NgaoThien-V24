"use client";

import { useState } from "react";
import BachBaoPanel from "./BachBaoPanel";
import XoSoChiDinhTool from "./XoSoChiDinhTool";
import XoSoLuotQuayTool from "./XoSoLuotQuayTool";
import XoSoVongEditor from "./XoSoVongEditor";

type Tab = "items" | "rig" | "vong";

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: 10,
    border: active ? "1px solid #f5a623" : "1px solid rgba(255,255,255,0.14)",
    background: active ? "rgba(245,166,35,0.18)" : "rgba(255,255,255,0.04)",
    color: "inherit",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  };
}

export default function BachBaoTabs() {
  const [tab, setTab] = useState<Tab>("items");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <button type="button" style={tabStyle(tab === "items")} onClick={() => setTab("items")}>
          🛍️ Vật phẩm shop
        </button>
        <button type="button" style={tabStyle(tab === "rig")} onClick={() => setTab("rig")}>
          🍉 Rig Xổ Số
        </button>
        <button type="button" style={tabStyle(tab === "vong")} onClick={() => setTab("vong")}>
          🎡 Sửa vòng quay
        </button>
      </div>
      {/* Bang luot quay dat NGAY DUOI o Rig: dat "Luot thu N" phai nhin so o bang do moi trung,
          tach sang tab khac la lai phai nho so roi bam qua bam lai. */}
      {tab === "items" ? (
        <BachBaoPanel />
      ) : tab === "rig" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <XoSoLuotQuayTool />
          <XoSoChiDinhTool />
        </div>
      ) : (
        <XoSoVongEditor />
      )}
    </div>
  );
}
