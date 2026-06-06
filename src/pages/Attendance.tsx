import React, { useState, useEffect, useMemo, useRef } from "react";
import { useInventory } from "../context/InventoryContext";
import { ref, onValue, update } from "firebase/database";
import { rtdb } from "../lib/firebase";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Settings,
  ChevronDown,
  Check,
} from "lucide-react";

function getHolidays(year: number): Record<string, string> {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  const easter = new Date(year, month - 1, day);

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const toYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const carnaval = addDays(easter, -47);
  const sextaSanta = addDays(easter, -2);
  const corpusChristi = addDays(easter, 60);

  return {
    [`${year}-01-01`]: "Confraternização Universal (Ano Novo)",
    [toYMD(carnaval)]: "Carnaval",
    [toYMD(sextaSanta)]: "Sexta-feira Santa (Paixão de Cristo)",
    [toYMD(easter)]: "Páscoa",
    [`${year}-04-21`]: "Tiradentes",
    [`${year}-05-01`]: "Dia do Trabalhador",
    [toYMD(corpusChristi)]: "Corpus Christi",
    [`${year}-09-07`]: "Independência do Brasil",
    [`${year}-10-12`]: "Nossa Senhora Aparecida",
    [`${year}-11-02`]: "Finados",
    [`${year}-11-15`]: "Proclamação da República",
    [`${year}-12-25`]: "Natal",
  };
}

type AttendanceStatus =
  | "presente"
  | "falta"
  | "atrasado"
  | "saiu_cedo"
  | "atestado"
  | "feriado"
  | "fim_de_semana"
  | "nao_registrado"
  | "ferias";

interface AttendanceRecord {
  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
  note: string;
}

const DEFAULT_RECORD: AttendanceRecord = {
  status: "nao_registrado",
  checkIn: "07:00",
  checkOut: "17:00",
  note: "",
};

const toYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatRole = (r: string) => {
  if (r === "MESTRE") return "Mestre Desenvolvedor";
  if (r === "ADM") return "Administrador";
  if (r === "LIDER") return "Líder de Equipe";
  if (r === "FUNCIONARIO_A") return "Confecção A";
  if (r === "FUNCIONARIO_B") return "Confecção B";
  return r;
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function Attendance() {
  const { users, currentUser } = useInventory();

  const visibleUsers = useMemo(() => {
    return users.filter(
      (u) => u.role !== "MESTRE" && !u.name.toLowerCase().includes("luciana"),
    );
  }, [users]);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [currentMonth, setCurrentMonth] = useState<number>(
    selectedDate.getMonth(),
  );
  const [currentYear, setCurrentYear] = useState<number>(
    selectedDate.getFullYear(),
  );

  const [allAttendanceData, setAllAttendanceData] = useState<
    Record<string, Record<string, AttendanceRecord>>
  >({});

  const canEdit =
    currentUser?.role === "MESTRE" ||
    currentUser?.role === "ADM" ||
    currentUser?.role === "LIDER";
  const selectedUser =
    visibleUsers.find((u) => u.id === selectedUserId) ||
    visibleUsers[0] ||
    currentUser;

  const holidays = useMemo(() => getHolidays(currentYear), [currentYear]);

  useEffect(() => {
    if (!selectedUserId) {
      if (currentUser && currentUser.role !== "MESTRE") {
        setSelectedUserId(currentUser.id);
      } else if (visibleUsers.length > 0) {
        setSelectedUserId(visibleUsers[0].id);
      }
    }
  }, [currentUser, selectedUserId, visibleUsers]);

  useEffect(() => {
    const unsub = onValue(ref(rtdb, "inventory/attendance"), (snap) => {
      if (snap.exists()) setAllAttendanceData(snap.val());
      else setAllAttendanceData({});
    });
    return () => unsub();
  }, []);

  const handleUpdateAttendance = (
    date: Date,
    userId: string,
    field: keyof AttendanceRecord,
    value: string,
  ) => {
    if (!canEdit) return;
    const ymd = toYMD(date);
    let currentRecord = allAttendanceData[ymd]?.[userId] || {
      ...DEFAULT_RECORD,
    };

    if (currentRecord.status === "nao_registrado") {
      if (holidays[ymd]) currentRecord.status = "feriado";
      else if (date.getDay() === 0 || date.getDay() === 6)
        currentRecord.status = "fim_de_semana";
    }

    const updatedRecord = { ...currentRecord, [field]: value };
    update(
      ref(rtdb, `inventory/attendance/${ymd}/${userId}`),
      updatedRecord,
    ).catch((err) => console.error(err));
  };

  const lancarPontoRapido = () => {
    if (!canEdit || !selectedUser) return;
    const ymd = toYMD(selectedDate);
    const rec = allAttendanceData[ymd]?.[selectedUser.id] || {
      ...DEFAULT_RECORD,
    };
    if (rec.status === "nao_registrado") {
      const nr = {
        ...rec,
        status: "presente",
        checkIn: "07:00",
        checkOut: "17:00",
      };
      update(
        ref(rtdb, `inventory/attendance/${ymd}/${selectedUser.id}`),
        nr,
      ).catch(console.error);
    }
  };

  const handleMonthChange = (step: number) => {
    let newM = currentMonth + step;
    let newY = currentYear;
    if (newM < 0) {
      newM = 11;
      newY--;
    } else if (newM > 11) {
      newM = 0;
      newY++;
    }
    setCurrentMonth(newM);
    setCurrentYear(newY);
  };

  const { totalHours, totalMins } = useMemo(() => {
    let m = 0;
    if (!selectedUser) return { totalHours: 0, totalMins: 0 };

    const daysInM = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInM; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const y = toYMD(d);
      const rec = allAttendanceData[y]?.[selectedUser.id];
      if (
        rec &&
        (rec.status === "presente" ||
          rec.status === "atrasado" ||
          rec.status === "saiu_cedo") &&
        rec.checkIn &&
        rec.checkOut
      ) {
        const [iH, iM] = rec.checkIn.split(":").map(Number);
        const [oH, oM] = rec.checkOut.split(":").map(Number);
        const diff = oH * 60 + oM - (iH * 60 + iM);
        if (diff > 0) m += diff;
      }
    }
    return { totalHours: Math.floor(m / 60), totalMins: m % 60 };
  }, [allAttendanceData, selectedUser, currentMonth, currentYear]);

  const renderCalendarDays = () => {
    if (!selectedUser) return [];

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const startingDayOfWeek = startOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const ymd = toYMD(date);
      const isSelected =
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      const record = allAttendanceData[ymd]?.[selectedUser.id];
      const status =
        record?.status ||
        (holidays[ymd]
          ? "feriado"
          : date.getDay() === 0 || date.getDay() === 6
            ? "fim_de_semana"
            : "nao_registrado");

      let indicatorColor = "transparent";
      if (
        status === "presente" ||
        status === "nao_registrado"
      ) {
        indicatorColor = "#34d399"; // emerald-400
      } else if (status === "atrasado") {
        indicatorColor = "#fbbf24"; // amber-400
      } else if (status === "saiu_cedo") {
        indicatorColor = "#38bdf8"; // sky-400
      } else if (status === "falta") {
        indicatorColor = "#fb7185"; // rose-400
      } else if (status === "atestado") {
        indicatorColor = "#a855f7"; // purple-500
      } else if (status === "ferias") {
        indicatorColor = "#ec4899"; // pink-500
      } else if (status === "feriado" || status === "fim_de_semana") {
        indicatorColor = "#64748b"; // slate-500
      }

      days.push(
        <button
          key={i}
          onClick={() => {
            setSelectedDate(new Date(currentYear, currentMonth, i));
          }}
          className={`h-11 w-11 flex flex-col items-center justify-center rounded-2xl text-sm font-bold mx-auto transition-all relative cursor-pointer ${
            isSelected
              ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0b0c10] text-purple-400 bg-purple-500/10"
              : "text-slate-300 hover:bg-white/5"
          }`}
        >
          {i}
          {indicatorColor !== "transparent" && (
            <span
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[18px] h-[3px] rounded-[1.5px]"
              style={{ backgroundColor: indicatorColor }}
            />
          )}
        </button>,
      );
    }
    return days;
  };

  if (!selectedUser) return null;

  const selectedYmd = toYMD(selectedDate);
  const selectedRecord = allAttendanceData[selectedYmd]?.[selectedUser.id] || {
    ...DEFAULT_RECORD,
    status: holidays[selectedYmd]
      ? "feriado"
      : selectedDate.getDay() === 0 || selectedDate.getDay() === 6
        ? "fim_de_semana"
        : "nao_registrado",
  };

  const todayYmd = toYMD(new Date());
  const todayRecord = allAttendanceData[todayYmd]?.[selectedUser.id] || {
    ...DEFAULT_RECORD,
    status: holidays[todayYmd]
      ? "feriado"
      : new Date().getDay() === 0 || new Date().getDay() === 6
        ? "fim_de_semana"
        : "nao_registrado",
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1400px] mx-auto p-2 pb-24 lg:pb-8">
      {/* Header Titles */}
      <div className="mb-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          Lista de Presença
        </h2>
        <p className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">
          Módulo Ativo
        </p>
      </div>

      {/* Top Banner (User & Legend) */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row items-start justify-between gap-8 relative overflow-visible ring-1 ring-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        {/* Users Horizontal List */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-wrap sm:flex-nowrap sm:overflow-x-auto gap-3 pb-4 sm:pb-2 custom-scrollbar pr-4">
            {visibleUsers.map((u) => {
              const isSelected = u.id === selectedUserId;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl shrink-0 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-500/10 ring-1 ring-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "hover:bg-white/5 ring-1 ring-white/5"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-[14px] overflow-hidden shrink-0 transition-all ${isSelected ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-[#0b0c10]" : ""}`}
                  >
                    <img
                      src={u.avatarUrl}
                      className="w-full h-full object-cover"
                      alt="Avatar"
                    />
                  </div>
                  <div className="pr-4">
                    <div className="text-sm font-black text-white uppercase tracking-tight">
                      {u.name.split(" ")[0]}
                    </div>
                    <div className="text-[9px] text-purple-400 font-bold uppercase tracking-widest leading-none mt-1.5">
                      {formatRole(u.role)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-2 sm:mt-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-3 min-w-[120px]">
              <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Status Hoje ({selectedUser.name.split(" ")[0]})
              </div>
              <div className="text-xs font-black text-amber-500 uppercase tracking-widest mt-2">
                {todayRecord.status === "nao_registrado"
                  ? "PENDENTE"
                  : todayRecord.status.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-4 shrink-0 lg:pl-10 lg:border-l border-white/5 w-full lg:w-auto mt-6 lg:mt-0">
          <h4 className="text-[9px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-2">
            <Settings size={12} /> Configurar Legenda
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-6 gap-y-3.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#34d399] rounded-[4px] shadow-[0_0_10px_#34d39940]" />{" "}
              TRABALHOU
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#fb7185] rounded-[4px] shadow-[0_0_10px_#fb718540]" />{" "}
              FALTA
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#fbbf24] rounded-[4px] shadow-[0_0_10px_#fbbf2440]" />{" "}
              ATRASOU
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#38bdf8] rounded-[4px] shadow-[0_0_10px_#38bdf840]" />{" "}
              SAIU CEDO
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#a855f7] rounded-[4px] shadow-[0_0_10px_#a855f740]" />{" "}
              ATESTADO
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-[#ec4899] rounded-[4px] shadow-[0_0_10px_#ec489940]" />{" "}
              FÉRIAS
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <div className="w-3.5 h-3.5 bg-[#64748b] rounded-[4px]" />{" "}
              FOLGA / FERIADO
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] gap-6">
        {/* Calendar Left Panel */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-[2rem] p-6 xl:p-8 flex flex-col w-full shadow-2xl relative ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => handleMonthChange(-1)}
              className="w-9 h-9 flex items-center justify-center bg-white/[0.02] border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft size={16} className="text-slate-400" />
            </button>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={() => handleMonthChange(1)}
              className="w-9 h-9 flex items-center justify-center bg-white/[0.02] border border-white/5 hover:bg-white/10 hover:border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-5">
            {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((day) => (
              <div
                key={day}
                className="text-[9px] font-black uppercase tracking-widest text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1">
            {renderCalendarDays()}
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 hidden md:block">
            <button className="w-full bg-[#14151a] hover:bg-white/5 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
              Planejar Férias
            </button>
          </div>
        </div>

        {/* Daily Panel Right */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-[2rem] p-6 lg:p-8 flex flex-col relative w-full shadow-2xl ring-1 ring-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                {String(selectedDate.getDate()).padStart(2, "0")} DE{" "}
                {MONTHS[selectedDate.getMonth()]}
              </h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2">
                {holidays[selectedYmd]
                  ? `FERIADO: ${holidays[selectedYmd]}`
                  : "REGISTROS DE ATIVIDADE"}
              </p>
            </div>

            {canEdit && selectedRecord.status === "nao_registrado" && (
              <button
                onClick={lancarPontoRapido}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-[0_0_20px_var(--tw-shadow-color)] shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Clock size={16} /> Lançar Ponto
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
            {/* Resumo do Dia / Status */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Check size={14} /> Resumo do Dia
              </h4>

              <div className="bg-[#14151a] border border-white/5 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-inner">
                <div className="p-3 bg-white/5 border border-white/5 rounded-[1rem]">
                  <Clock size={20} className="text-slate-400" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                    STATUS:{" "}
                    {selectedRecord.status === "nao_registrado"
                      ? "PENDENTE"
                      : selectedRecord.status === "presente"
                        ? "TRABALHOU"
                        : selectedRecord.status === "atrasado"
                          ? "CHEGOU ATRASADO"
                          : selectedRecord.status === "saiu_cedo"
                            ? "SAIU CEDO"
                            : selectedRecord.status.replace(/_/g, " ")}
                  </div>
                  <p className="text-xs text-slate-300 font-bold mt-1.5 leading-relaxed">
                    {selectedRecord.status === "nao_registrado"
                      ? "Escala ativa - lançamento aguardando registro no sistema."
                      : selectedRecord.status === "presente"
                        ? `Ponto de jornada registrado: trabalhou de ${selectedRecord.checkIn} às ${selectedRecord.checkOut}.`
                        : selectedRecord.status === "atrasado"
                          ? `Funcionário chegou atrasado no horário: registrado às ${selectedRecord.checkIn}.`
                          : selectedRecord.status === "saiu_cedo"
                            ? `Funcionário saiu mais cedo do expediente: registrado às ${selectedRecord.checkOut}.`
                            : `Registro preenchido com status: ${selectedRecord.status.replace(/_/g, " ")}.`}
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                    Entrada
                  </label>
                  <input
                    type="time"
                    disabled={!canEdit}
                    value={selectedRecord.checkIn}
                    onChange={(e) =>
                      handleUpdateAttendance(
                        selectedDate,
                        selectedUser.id,
                        "checkIn",
                        e.target.value,
                      )
                    }
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white [color-scheme:dark] outline-none focus:border-purple-500/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                    Saída
                  </label>
                  <input
                    type="time"
                    disabled={!canEdit}
                    value={selectedRecord.checkOut}
                    onChange={(e) =>
                      handleUpdateAttendance(
                        selectedDate,
                        selectedUser.id,
                        "checkOut",
                        e.target.value,
                      )
                    }
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white [color-scheme:dark] outline-none focus:border-purple-500/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                    Status Final
                  </label>
                  <select
                    disabled={!canEdit}
                    value={selectedRecord.status}
                    onChange={(e) =>
                      handleUpdateAttendance(
                        selectedDate,
                        selectedUser.id,
                        "status",
                        e.target.value,
                      )
                    }
                    className="w-full bg-[#14151a] border border-white/10 rounded-xl px-4 py-3 sm:py-3.5 text-xs font-black text-white outline-none focus:border-purple-500/50 appearance-none uppercase tracking-widest disabled:opacity-50"
                  >
                    <option value="presente">TRABALHOU (PRESENTE)</option>
                    <option value="falta">FALTA</option>
                    <option value="atrasado">CHEGOU ATRASADO</option>
                    <option value="saiu_cedo">SAIU CEDO</option>
                    <option value="ferias">FÉRIAS</option>
                    <option value="fim_de_semana">FOLGA</option>
                    <option value="feriado">FOLGA EXTRA (FERIADO)</option>
                    <option value="atestado">ATESTADO MÉDICO</option>
                    <option value="nao_registrado">NÃO REGISTRADO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compromissos & Lembretes */}
            <div className="space-y-5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CalendarIcon size={14} /> Compromissos & Lembretes
              </h4>
              <div className="relative h-[calc(100%-36px)]">
                <textarea
                  value={selectedRecord.note}
                  onChange={(e) =>
                    handleUpdateAttendance(
                      selectedDate,
                      selectedUser.id,
                      "note",
                      e.target.value,
                    )
                  }
                  disabled={!canEdit}
                  placeholder="Adicionar nota de justificativa, falta, atraso, ou atestado..."
                  className="w-full h-full min-h-[160px] bg-[#14151a] border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-purple-500/50 resize-none placeholder:text-slate-600 disabled:opacity-50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
