"use client";

import { AlertTriangle, CalendarDays, Copy, MapPinned, Power, ShieldCheck, Sparkles, Swords } from "lucide-react";
import { useState } from "react";
import { EVENT_TEMPLATES, type EventRewardEntry } from "@/lib/event-templates";

function RewardList({ entries }: { entries: EventRewardEntry[] }) {
  return (
    <div className="event-reward-list">
      {entries.map((entry) => (
        <article key={`${entry.label}-${entry.pid ?? ""}`}>
          <div>
            <strong>{entry.label}</strong>
            <span>{entry.detail}</span>
            {entry.pid ? <code>PID {entry.pid}</code> : null}
          </div>
          {entry.rate ? <b>{entry.rate}</b> : null}
        </article>
      ))}
    </div>
  );
}

export default function EventTemplateTool() {
  const [selectedId, setSelectedId] = useState("TRUY_SAT_HAC_PHONG");
  const selected = EVENT_TEMPLATES.find((event) => event.id === selectedId) ?? EVENT_TEMPLATES[0];

  return (
    <div className="operations-body event-template-tool">
      <div className="event-library-header">
        <div>
          <span className="event-template-label">TEMPLATE</span>
          <h3>Thư viện Event dùng lại</h3>
          <p>
            Lưu cấu hình chuẩn để những lần sau chỉ cần nhân bản, đổi lịch, map,
            quái, quà và thông báo.
          </p>
        </div>
        <button type="button" disabled title="Sẽ mở khi chức năng lưu Event mới được nối với Gateway">
          <Copy size={16} /> Tạo Event từ Template
        </button>
      </div>

      <div className="operations-message">
        Template được đóng gói sẵn trong Dashboard, không gọi thêm API khi mở mục Event.
      </div>

      <div className="event-template-layout">
        <aside className="event-template-list" aria-label="Danh sách Event">
          <div className="event-template-list-title">
            <strong>Event đã lưu</strong>
            <span>{EVENT_TEMPLATES.length} mẫu</span>
          </div>
          {EVENT_TEMPLATES.map((event) => (
            <button
              type="button"
              className={selected?.id === event.id ? "active" : ""}
              onClick={() => setSelectedId(event.id)}
              key={event.id}
            >
              <span className="event-template-label small">TEMPLATE</span>
              <strong>{event.name}</strong>
              <small>{event.schedule.durationDays} ngày · {event.schedule.dailyStart}–{event.schedule.dailyEnd}</small>
              <em><i /> Đang tắt</em>
            </button>
          ))}
        </aside>

        {selected ? (
          <main className="event-template-detail">
            <header className="event-template-hero">
              <div>
                <div className="event-template-meta">
                  <span className="event-template-label">TEMPLATE</span>
                  <span>Phiên bản {selected.version}</span>
                  <span>ID: {selected.id}</span>
                </div>
                <h2>{selected.playerName}</h2>
                <p>{selected.description}</p>
              </div>
              <div className="event-power-card">
                <span>TRẠNG THÁI</span>
                <strong><i /> TẮT</strong>
                <button type="button" disabled title="Chưa kết nối Event Engine GameServer">
                  <Power size={17} /> Bật Event
                </button>
                <small>Chưa đủ điều kiện vận hành</small>
              </div>
            </header>

            <section className="event-summary-grid">
              <article>
                <CalendarDays size={20} />
                <span>Lịch chạy</span>
                <strong>{selected.schedule.durationDays} ngày · {selected.schedule.dailyStart}–{selected.schedule.dailyEnd}</strong>
                <small>Ngày chạy chưa được chọn</small>
              </article>
              <article>
                <MapPinned size={20} />
                <span>Map</span>
                <strong>{selected.map.name}</strong>
                <small>Map {selected.map.id} · {selected.map.moveCommand}</small>
              </article>
              <article>
                <Swords size={20} />
                <span>Quái và Boss</span>
                <strong>Level 100 / 110</strong>
                <small>32 Trinh Sát · 2 Boss mỗi đợt</small>
              </article>
              <article>
                <ShieldCheck size={20} />
                <span>Kênh chạy</span>
                <strong>{selected.channel.label}</strong>
                <small>Mặc định không tự chọn kênh</small>
              </article>
            </section>

            <section className="event-detail-section">
              <div className="event-detail-heading">
                <div><span>CẤU HÌNH</span><h3>Quái, Boss và lịch sinh</h3></div>
                <b>{selected.schedule.bossWaves.length} đợt Boss</b>
              </div>
              <div className="event-monster-grid">
                {selected.monsters.map((monster) => (
                  <article key={monster.role}>
                    <span>{monster.role === "boss" ? "BOSS" : "TRINH SÁT"}</span>
                    <strong>{monster.name}</strong>
                    <p>Level {monster.level} · PID thử {monster.candidatePids.join(", ")}</p>
                    <small>
                      {monster.role === "boss"
                        ? `${monster.perWave} Boss/đợt`
                        : `${monster.alive} con đang sống · hồi sinh ${monster.respawnSeconds} giây`}
                    </small>
                  </article>
                ))}
              </div>
              <div className="event-wave-row">
                {selected.schedule.bossWaves.map((wave, index) => (
                  <span key={wave}><b>{index + 1}</b>{wave}</span>
                ))}
              </div>
            </section>

            <section className="event-detail-section">
              <div className="event-detail-heading">
                <div><span>LUẬT CHƠI</span><h3>Điều kiện và cách tính thắng</h3></div>
              </div>
              <div className="event-rule-list">
                {selected.rules.map((rule, index) => (
                  <p key={rule}><b>{index + 1}</b>{rule}</p>
                ))}
              </div>
            </section>

            <div className="event-reward-columns">
              <section className="event-detail-section">
                <div className="event-detail-heading">
                  <div><span>QUÀ NGÀY</span><h3>Tham gia hợp lệ</h3></div>
                </div>
                <RewardList entries={selected.participationRewards} />
              </section>
              <section className="event-detail-section">
                <div className="event-detail-heading">
                  <div><span>LAST-HIT BOSS</span><h3>Quà thắng Boss</h3></div>
                </div>
                <RewardList entries={selected.bossRewards} />
              </section>
            </div>

            <div className="event-reward-columns">
              <section className="event-detail-section">
                <div className="event-detail-heading">
                  <div><span>HỘP ĐAN</span><h3>Pool Pill</h3></div>
                </div>
                <RewardList entries={selected.pillPool} />
              </section>
              <section className="event-detail-section">
                <div className="event-detail-heading">
                  <div><span>HỘP ĐAN</span><h3>Pool Áo Choàng</h3></div>
                </div>
                <RewardList entries={selected.cloakPool} />
              </section>
            </div>

            <section className="event-detail-section">
              <div className="event-detail-heading">
                <div><span>TÍCH LŨY</span><h3>Mốc thưởng 10 ngày</h3></div>
                <b>Tổng 50.000 Võ Huân</b>
              </div>
              <div className="event-milestones">
                {selected.milestones.map((milestone) => (
                  <article key={milestone.day}>
                    <span>NGÀY</span>
                    <b>{milestone.day}</b>
                    <p>{milestone.reward}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="event-blockers">
              <div>
                <AlertTriangle size={22} />
                <div>
                  <strong>Chưa thể bật Event</strong>
                  <p>Hoàn thành các mục sau trước khi kết nối chạy thật.</p>
                </div>
              </div>
              <ul>
                {selected.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
              </ul>
            </section>

            <footer className="event-template-footer">
              <span><Sparkles size={15} /> Template đã được lưu trong thư viện Event</span>
              <button type="button" disabled>Lưu thay đổi</button>
            </footer>
          </main>
        ) : null}
      </div>
    </div>
  );
}
