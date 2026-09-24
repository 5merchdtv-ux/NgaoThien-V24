"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  ClipboardList,
  History,
  Lock,
  PlayCircle,
  RotateCcw,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PHASE_LABEL,
  type Runbook,
  type RunbookPhase,
  type RunbookStep,
} from "@/lib/runbooks";

type RunState = {
  batDau: string | null;
  ketThuc: string | null;
  /** id bước → thời điểm tick, dạng ISO. */
  daXong: Record<string, string>;
  nguoiThucHien: string;
};

type RunHistory = {
  batDau: string;
  ketThuc: string;
  nguoiThucHien: string;
  soBuoc: number;
};

const PHASES: RunbookPhase[] = ["truoc", "trong", "sau"];

function emptyRun(): RunState {
  return { batDau: null, ketThuc: null, daXong: {}, nguoiThucHien: "" };
}

function stateKey(id: string) {
  return `hknt-runbook-${id}`;
}

function historyKey(id: string) {
  return `hknt-runbook-${id}-lich-su`;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", { hour12: false });
}

export default function RunbookTool({ runbook }: { runbook: Runbook }) {
  const [run, setRun] = useState<RunState>(emptyRun);
  const [history, setHistory] = useState<RunHistory[]>([]);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [unlocked, setUnlocked] = useState(!runbook.confirmCode);
  const [loaded, setLoaded] = useState(false);

  // Đọc tiến độ đã lưu. Chỉ chạy trên trình duyệt vì dùng localStorage.
  useEffect(() => {
    try {
      const rawRun = window.localStorage.getItem(stateKey(runbook.id));
      if (rawRun) setRun({ ...emptyRun(), ...(JSON.parse(rawRun) as RunState) });
      const rawHistory = window.localStorage.getItem(historyKey(runbook.id));
      if (rawHistory) setHistory(JSON.parse(rawHistory) as RunHistory[]);
    } catch {
      // Dữ liệu hỏng thì bỏ qua, coi như chưa có lần chạy nào.
    }
    setLoaded(true);
  }, [runbook.id]);

  // Ghi lại sau mỗi thay đổi, nhưng chỉ sau khi đã đọc xong lần đầu để
  // không ghi đè tiến độ cũ bằng trạng thái rỗng lúc mới mở trang.
  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(stateKey(runbook.id), JSON.stringify(run));
  }, [loaded, run, runbook.id]);

  const total = runbook.steps.length;
  const doneCount = useMemo(
    () => runbook.steps.filter((step) => run.daXong[step.id]).length,
    [run.daXong, runbook.steps],
  );
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const dangChay = Boolean(run.batDau) && !run.ketThuc;
  const hoanTat = doneCount === total && total > 0;

  const checkCode = useCallback(() => {
    if (!runbook.confirmCode) return;
    if (code === runbook.confirmCode) {
      setUnlocked(true);
      setCodeError("");
      return;
    }
    setUnlocked(false);
    setCodeError("Mã xác nhận không đúng. Quy trình vẫn đang khoá.");
  }, [code, runbook.confirmCode]);

  const batDau = useCallback(() => {
    setRun({
      batDau: new Date().toISOString(),
      ketThuc: null,
      daXong: {},
      nguoiThucHien: run.nguoiThucHien,
    });
  }, [run.nguoiThucHien]);

  const toggleStep = useCallback((stepId: string) => {
    setRun((prev) => {
      const next = { ...prev.daXong };
      if (next[stepId]) delete next[stepId];
      else next[stepId] = new Date().toISOString();
      return { ...prev, daXong: next };
    });
  }, []);

  const ketThuc = useCallback(() => {
    const now = new Date().toISOString();
    setRun((prev) => {
      const finished = { ...prev, ketThuc: now };
      if (prev.batDau) {
        const entry: RunHistory = {
          batDau: prev.batDau,
          ketThuc: now,
          nguoiThucHien: prev.nguoiThucHien || "không ghi tên",
          soBuoc: Object.keys(prev.daXong).length,
        };
        setHistory((old) => {
          const merged = [entry, ...old].slice(0, 20);
          window.localStorage.setItem(historyKey(runbook.id), JSON.stringify(merged));
          return merged;
        });
      }
      return finished;
    });
  }, [runbook.id]);

  const lamLai = useCallback(() => {
    setRun(emptyRun());
    if (runbook.confirmCode) {
      setUnlocked(false);
      setCode("");
    }
  }, [runbook.confirmCode]);

  const khoa = Boolean(runbook.confirmCode) && !unlocked;

  return (
    <section className="runbook">
      <header className="runbook-head">
        <div className="runbook-head-title">
          <ClipboardList size={20} />
          <div>
            <h2>{runbook.title}</h2>
            <p>{runbook.summary}</p>
          </div>
        </div>
        <div className="runbook-tool">
          <Terminal size={15} />
          <span>{runbook.tool}</span>
        </div>
      </header>

      <div className="runbook-notice">
        <ShieldAlert size={16} />
        <p>
          Trang này <strong>không tự chạy</strong> thao tác. Việc thực thi nằm ở công cụ
          trên VPS vì cần quyền Administrator và các lớp xác nhận riêng. Đây là bảng quy
          trình bắt buộc: tick từng bước để không bỏ sót và để biết đang tới đâu.
        </p>
      </div>

      {khoa ? (
        <div className="runbook-lock">
          <div className="runbook-lock-head">
            <Lock size={18} />
            <div>
              <strong>Quy trình đang khoá</strong>
              <span>Nhập mã xác nhận để mở danh sách bước.</span>
            </div>
          </div>
          <div className="runbook-lock-form">
            <input
              type="password"
              value={code}
              placeholder="Mã xác nhận"
              autoComplete="off"
              onChange={(event) => {
                setCode(event.target.value);
                setCodeError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") checkCode();
              }}
            />
            <button type="button" onClick={checkCode}>
              Mở khoá
            </button>
          </div>
          {codeError ? <p className="runbook-lock-error">{codeError}</p> : null}
        </div>
      ) : (
        <>
          <div className="runbook-progress">
            <div className="runbook-progress-info">
              <strong>
                {doneCount}/{total} bước
              </strong>
              <span>{percent}%</span>
            </div>
            <div className="runbook-progress-bar">
              <i style={{ width: `${percent}%` }} className={hoanTat ? "xong" : ""} />
            </div>
            <div className="runbook-progress-meta">
              <span>Bắt đầu: {formatTime(run.batDau)}</span>
              <span>Kết thúc: {formatTime(run.ketThuc)}</span>
            </div>
          </div>

          <div className="runbook-actions">
            <input
              type="text"
              className="runbook-operator"
              placeholder="Người thực hiện"
              value={run.nguoiThucHien}
              onChange={(event) =>
                setRun((prev) => ({ ...prev, nguoiThucHien: event.target.value }))
              }
            />
            {!dangChay && !run.ketThuc ? (
              <button type="button" className="runbook-btn primary" onClick={batDau}>
                <PlayCircle size={16} /> Bắt đầu quy trình
              </button>
            ) : null}
            {dangChay ? (
              <button
                type="button"
                className="runbook-btn finish"
                disabled={!hoanTat}
                onClick={ketThuc}
                title={hoanTat ? "" : "Phải tick đủ tất cả các bước"}
              >
                <CheckCircle2 size={16} />
                {hoanTat ? "Đánh dấu hoàn tất" : `Còn ${total - doneCount} bước`}
              </button>
            ) : null}
            <button type="button" className="runbook-btn ghost" onClick={lamLai}>
              <RotateCcw size={16} /> Làm lại từ đầu
            </button>
          </div>

          {!run.batDau ? (
            <div className="runbook-hint">
              <AlertTriangle size={15} /> Bấm <strong>Bắt đầu quy trình</strong> trước khi
              tick, để hệ thống ghi được mốc thời gian của lần chạy này.
            </div>
          ) : null}

          {PHASES.map((phase) => {
            const steps = runbook.steps.filter((step) => step.phase === phase);
            if (steps.length === 0) return null;
            return (
              <div className="runbook-phase" key={phase}>
                <h3>{PHASE_LABEL[phase]}</h3>
                <ol className="runbook-steps">
                  {steps.map((step) => (
                    <StepRow
                      key={step.id}
                      step={step}
                      doneAt={run.daXong[step.id] ?? null}
                      disabled={!run.batDau || Boolean(run.ketThuc)}
                      onToggle={() => toggleStep(step.id)}
                    />
                  ))}
                </ol>
              </div>
            );
          })}

          {history.length > 0 ? (
            <div className="runbook-history">
              <h3>
                <History size={16} /> Các lần đã chạy
              </h3>
              <ul>
                {history.map((item, index) => (
                  <li key={`${item.batDau}-${index}`}>
                    <strong>{formatTime(item.batDau)}</strong>
                    <span>→ {formatTime(item.ketThuc)}</span>
                    <em>{item.nguoiThucHien}</em>
                    <span>{item.soBuoc} bước</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function StepRow({
  step,
  doneAt,
  disabled,
  onToggle,
}: {
  step: RunbookStep;
  doneAt: string | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  const done = Boolean(doneAt);
  return (
    <li className={`runbook-step${done ? " xong" : ""}${step.critical ? " quan-trong" : ""}`}>
      <button
        type="button"
        className="runbook-step-check"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={done}
        title={disabled ? "Bấm Bắt đầu quy trình trước" : "Đánh dấu bước này"}
      >
        {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>
      <div className="runbook-step-body">
        <div className="runbook-step-title">
          <strong>{step.title}</strong>
          {step.critical ? (
            <span className="runbook-tag">
              <AlertTriangle size={12} /> Không được bỏ qua
            </span>
          ) : null}
        </div>
        <p>{step.detail}</p>
        {step.target ? <code>{step.target}</code> : null}
        {doneAt ? <span className="runbook-step-time">Đã tick lúc {formatTime(doneAt)}</span> : null}
      </div>
    </li>
  );
}
