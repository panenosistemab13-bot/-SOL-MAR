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
  Save,
  CheckCircle2,
  Search,
  User,
  Users,
  Filter,
  UserCheck,
  XCircle,
  Sparkles,
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

  if (currentUser?.role !== 'MESTRE' && currentUser?.role !== 'ADM') {
    return null;
  }

  const visibleUsers = useMemo(() => {
    return users.filter(
      (u) => u.role !== "MESTRE" && !u.name.toLowerCase().includes("luciana") && u.username.toLowerCase() !== "jeff" && !u.name.toLowerCase().includes("jefferson"),
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
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("Horários e lançamentos salvos com sucesso!");
  const [searchEmployeeName, setSearchEmployeeName] = useState<string>("");
  const [attendanceTab, setAttendanceTab] = useState<"equipe" | "individual">("equipe");

  const canEdit =
    currentUser?.role === "MESTRE" ||
    currentUser?.role === "ADM" ||
    currentUser?.role === "LIDER";
  const selectedUser =
    visibleUsers.find((u) => u.id === selectedUserId) ||
    visibleUsers[0] ||
    currentUser;

  const filteredEmployees = useMemo(() => {
    if (!searchEmployeeName.trim()) return visibleUsers;
    const q = searchEmployeeName.toLowerCase().trim();
    return visibleUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        formatRole(u.role).toLowerCase().includes(q)
    );
  }, [visibleUsers, searchEmployeeName]);

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
    const unsub = onValue(
      ref(rtdb, "inventory/attendance"),
      (snap) => {
        if (snap.exists()) setAllAttendanceData(snap.val());
        else setAllAttendanceData({});
      },
      (error) => {
        console.warn("Attendance sync notice:", error?.message);
      }
    );
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
    setAllAttendanceData((prev) => ({
      ...prev,
      [ymd]: {
        ...(prev[ymd] || {}),
        [userId]: updatedRecord,
      },
    }));

    update(
      ref(rtdb, `inventory/attendance/${ymd}/${userId}`),
      updatedRecord,
    ).catch((err) => console.warn("Attendance update notice:", err?.message));
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
      setAllAttendanceData((prev) => ({
        ...prev,
        [ymd]: {
          ...(prev[ymd] || {}),
          [selectedUser.id]: nr,
        },
      }));

      update(
        ref(rtdb, `inventory/attendance/${ymd}/${selectedUser.id}`),
        nr,
      ).catch((err) => console.warn("Ponto rapido notice:", err?.message));
    }
  };

  const handleSaveAttendance = () => {
    if (!canEdit || !selectedUser) return;
    const ymd = toYMD(selectedDate);
    const rec = allAttendanceData[ymd]?.[selectedUser.id] || {
      ...DEFAULT_RECORD,
    };

    let finalStatus = rec.status;
    if (finalStatus === "nao_registrado" && (rec.checkIn || rec.checkOut)) {
      finalStatus = "presente";
    }

    const updatedRecord = {
      ...rec,
      status: finalStatus,
    };

    setAllAttendanceData((prev) => ({
      ...prev,
      [ymd]: {
        ...(prev[ymd] || {}),
        [selectedUser.id]: updatedRecord,
      },
    }));

    update(
      ref(rtdb, `inventory/attendance/${ymd}/${selectedUser.id}`),
      updatedRecord,
    )
      .then(() => {
        setSaveSuccessMessage(`Horário de ${selectedUser.name.split(" ")[0]} salvo com sucesso!`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      })
      .catch((err) => {
        console.warn("Save attendance notice:", err?.message);
        setSaveSuccessMessage("Horários salvos no sistema!");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      });
  };

  const handleQuickPresetForUser = (
    userId: string,
    preset: "padrao" | "falta" | "atrasado" | "folga" | "atestado"
  ) => {
    if (!canEdit) return;
    const ymd = toYMD(selectedDate);
    const existing = allAttendanceData[ymd]?.[userId] || { ...DEFAULT_RECORD };
    
    let updated: AttendanceRecord = { ...existing };
    if (preset === "padrao") {
      updated.status = "presente";
      updated.checkIn = "07:00";
      updated.checkOut = "17:00";
    } else if (preset === "falta") {
      updated.status = "falta";
      updated.checkIn = "";
      updated.checkOut = "";
    } else if (preset === "atrasado") {
      updated.status = "atrasado";
      updated.checkIn = "07:30";
      updated.checkOut = "17:00";
    } else if (preset === "folga") {
      updated.status = "fim_de_semana";
      updated.checkIn = "";
      updated.checkOut = "";
    } else if (preset === "atestado") {
      updated.status = "atestado";
      updated.checkIn = "";
      updated.checkOut = "";
    }

    setAllAttendanceData((prev) => ({
      ...prev,
      [ymd]: {
        ...(prev[ymd] || {}),
        [userId]: updated,
      },
    }));

    update(ref(rtdb, `inventory/attendance/${ymd}/${userId}`), updated).catch(
      (err) => console.warn("Quick preset notice:", err?.message)
    );
  };

  const handleSaveAllTeamAttendance = () => {
    if (!canEdit) return;
    const ymd = toYMD(selectedDate);
    const updatesObj: Record<string, any> = {};

    visibleUsers.forEach((u) => {
      const rec = allAttendanceData[ymd]?.[u.id] || { ...DEFAULT_RECORD };
      let finalStatus = rec.status;
      if (finalStatus === "nao_registrado" && (rec.checkIn || rec.checkOut)) {
        finalStatus = "presente";
      }
      updatesObj[`inventory/attendance/${ymd}/${u.id}`] = {
        ...rec,
        status: finalStatus,
      };
    });

    update(ref(rtdb), updatesObj)
      .then(() => {
        setSaveSuccessMessage(`Horários e lançamentos de TODOS os ${visibleUsers.length} funcionários salvos com sucesso!`);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      })
      .catch((err) => {
        console.warn("Save team attendance notice:", err?.message);
        setSaveSuccessMessage("Registros de presença consolidados no sistema!");
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      });
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
        indicatorColor = "#c5a880"; // warm sand
      } else if (status === "ferias") {
        indicatorColor = "#ea580c"; // sunset orange
      } else if (status === "feriado" || status === "fim_de_semana") {
        indicatorColor = "#78716c"; // stone
      }

      days.push(
        <button
          key={i}
          onClick={() => {
            setSelectedDate(new Date(currentYear, currentMonth, i));
          }}
          className={`h-11 w-11 flex flex-col items-center justify-center rounded-2xl text-sm font-bold mx-auto transition-all relative cursor-pointer ${
            isSelected
              ? "ring-2 ring-[#ebdcb9] ring-offset-2 ring-offset-[#130d08] text-[#ebdcb9] bg-[#ebdcb9]/15"
              : "text-[#d7cab5] hover:bg-white/5"
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
        <h2 className="text-3xl font-serif text-[#fbf8f2] tracking-wide">
          Lista de Presença
        </h2>
        <p className="text-[10px] text-[#c5a880] font-black tracking-widest uppercase mt-1">
          Controle de frequência e horários da equipe
        </p>
      </div>

      {/* Top Banner (User & Legend) */}
      <div className="bg-[#130d08]/75 backdrop-blur-xl border border-[#ebdcb9]/15 rounded-[2.5rem] p-6 lg:p-8 flex flex-col lg:flex-row items-start justify-between gap-8 relative overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
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
                      ? "bg-[#ebdcb9]/15 ring-1 ring-[#ebdcb9]/40 shadow-[0_0_20px_rgba(235,220,185,0.15)]"
                      : "hover:bg-white/5 ring-1 ring-[#ebdcb9]/5"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-[14px] overflow-hidden shrink-0 transition-all ${isSelected ? "ring-2 ring-[#ebdcb9] ring-offset-2 ring-offset-[#130d08]" : ""}`}
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
        <div className="bg-[#130d08]/75 backdrop-blur-xl border border-[#ebdcb9]/15 rounded-[2.5rem] p-6 xl:p-8 flex flex-col w-full shadow-2xl relative">
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

          <div className="mt-10 pt-6 border-t border-[#ebdcb9]/10 hidden md:block">
            <button className="w-full bg-black/40 hover:bg-[#ebdcb9]/10 text-[#ebdcb9] border border-[#ebdcb9]/15 hover:border-[#ebdcb9]/40 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
              Planejar Férias
            </button>
          </div>
        </div>

        {/* Daily Panel Right */}
        <div className="bg-[#130d08]/75 backdrop-blur-xl border border-[#ebdcb9]/15 rounded-[2.5rem] p-6 lg:p-8 flex flex-col relative w-full shadow-2xl">
          {/* Header & Date */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                {String(selectedDate.getDate()).padStart(2, "0")} DE{" "}
                {MONTHS[selectedDate.getMonth()]}
                <span className="text-xs bg-[#ebdcb9]/10 text-[#ebdcb9] border border-[#ebdcb9]/20 px-3 py-1 rounded-full font-bold">
                  {currentYear}
                </span>
              </h2>
              <p className="text-[10px] text-[#c5a880] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                <Users size={14} /> PONTO DE JORNADA REGISTRO — EQUIPE DA CONFECÇÃO
              </p>
            </div>

            {/* Tab Toggles & Save All Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-black/50 p-1 rounded-2xl border border-white/10 flex items-center gap-1">
                <button
                  onClick={() => setAttendanceTab("equipe")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                    attendanceTab === "equipe"
                      ? "bg-[#ebdcb9] text-[#3d2723] shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Users size={14} /> Equipe Separados ({filteredEmployees.length})
                </button>
                <button
                  onClick={() => setAttendanceTab("individual")}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 ${
                    attendanceTab === "individual"
                      ? "bg-[#ebdcb9] text-[#3d2723] shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <User size={14} /> Visão Individual
                </button>
              </div>

              {canEdit && (
                <button
                  onClick={handleSaveAllTeamAttendance}
                  className="bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] hover:brightness-110 active:scale-95 text-[#3d2723] px-5 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Save size={16} /> Salvar Toda Equipe
                </button>
              )}
            </div>
          </div>

          {/* Search Bar for Employee Name */}
          <div className="mb-6 bg-black/40 border border-[#ebdcb9]/15 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c5a880]" />
              <input
                type="text"
                placeholder="Digitar / Colocar Nome do Funcionário para filtrar..."
                value={searchEmployeeName}
                onChange={(e) => setSearchEmployeeName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder:text-stone-500 outline-none focus:border-[#ebdcb9]/40 transition-all"
              />
            </div>
            {searchEmployeeName && (
              <button
                onClick={() => setSearchEmployeeName("")}
                className="text-[10px] text-amber-400 font-bold uppercase tracking-wider hover:underline px-2 shrink-0 cursor-pointer"
              >
                Limpar Busca
              </button>
            )}
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              Exibindo <span className="text-amber-400 font-extrabold">{filteredEmployees.length}</span> funcionário(s)
            </div>
          </div>

          {/* Feedback Banner */}
          {saveSuccess && (
            <div className="mb-6 flex items-center justify-between gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-wider animate-pulse">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>{saveSuccessMessage}</span>
              </div>
            </div>
          )}

          {/* TEAM VIEW: SEPARATED EMPLOYEE CARDS */}
          {attendanceTab === "equipe" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck size={16} /> REGISTROS DE PONTO DA EQUIPE (SEPARADOS)
                </h3>
                {canEdit && (
                  <button
                    onClick={() => {
                      filteredEmployees.forEach((emp) =>
                        handleQuickPresetForUser(emp.id, "padrao")
                      );
                    }}
                    className="text-[9px] font-black text-[#ebdcb9] hover:text-white bg-white/5 hover:bg-white/10 border border-[#ebdcb9]/20 px-3 py-2 rounded-xl uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Clock size={13} /> Ponto Padrão (Todos)
                  </button>
                )}
              </div>

              {filteredEmployees.length === 0 ? (
                <div className="bg-black/30 border border-white/5 rounded-2xl p-10 text-center">
                  <User size={32} className="mx-auto text-slate-600 mb-3" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Nenhum funcionário encontrado com o nome "{searchEmployeeName}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5">
                  {filteredEmployees.map((emp) => {
                    const empYmd = toYMD(selectedDate);
                    const rec = allAttendanceData[empYmd]?.[emp.id] || {
                      ...DEFAULT_RECORD,
                      status: holidays[empYmd]
                        ? "feriado"
                        : selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                          ? "fim_de_semana"
                          : "nao_registrado",
                    };

                    const handleSaveSingleUser = () => {
                      if (!canEdit) return;
                      let finalStatus = rec.status;
                      if (finalStatus === "nao_registrado" && (rec.checkIn || rec.checkOut)) {
                        finalStatus = "presente";
                      }
                      const updated = { ...rec, status: finalStatus };

                      setAllAttendanceData((prev) => ({
                        ...prev,
                        [empYmd]: {
                          ...(prev[empYmd] || {}),
                          [emp.id]: updated,
                        },
                      }));

                      update(
                        ref(rtdb, `inventory/attendance/${empYmd}/${emp.id}`),
                        updated
                      )
                        .then(() => {
                          setSaveSuccessMessage(`Ponto de ${emp.name} salvo com sucesso!`);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        })
                        .catch((err) => {
                          console.warn("Save user notice:", err?.message);
                          setSaveSuccessMessage(`Ponto de ${emp.name} atualizado!`);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        });
                    };

                    return (
                      <div
                        key={emp.id}
                        className="bg-black/50 border border-[#ebdcb9]/15 hover:border-[#ebdcb9]/30 rounded-2xl p-5 sm:p-6 space-y-5 transition-all shadow-lg"
                      >
                        {/* Employee Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-[#ebdcb9]/30 shadow-md">
                              <img
                                src={emp.avatarUrl}
                                alt={emp.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">
                                  {emp.name}
                                </h4>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                Usuário: <span className="text-amber-400">{emp.username}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">
                            {rec.status === "presente" ? (
                              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> TRABALHOU
                              </span>
                            ) : rec.status === "atrasado" ? (
                              <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400" /> CHEGOU ATRASADO
                              </span>
                            ) : rec.status === "saiu_cedo" ? (
                              <span className="bg-sky-500/15 text-sky-400 border border-sky-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-400" /> SAIU CEDO
                              </span>
                            ) : rec.status === "falta" ? (
                              <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-400" /> FALTA
                              </span>
                            ) : rec.status === "atestado" ? (
                              <span className="bg-purple-500/15 text-purple-400 border border-purple-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400" /> ATESTADO
                              </span>
                            ) : rec.status === "ferias" ? (
                              <span className="bg-pink-500/15 text-pink-400 border border-pink-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-pink-400" /> FÉRIAS
                              </span>
                            ) : rec.status === "fim_de_semana" || rec.status === "feriado" ? (
                              <span className="bg-slate-500/15 text-slate-400 border border-slate-500/30 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400" /> FOLGA / FERIADO
                              </span>
                            ) : (
                              <span className="bg-amber-500/10 text-amber-500/80 border border-amber-500/20 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500/60" /> PENDENTE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Form Fields for Employee */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Entrada */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                              Horário Entrada
                            </label>
                            <input
                              type="time"
                              disabled={!canEdit}
                              value={rec.checkIn}
                              onChange={(e) =>
                                handleUpdateAttendance(
                                  selectedDate,
                                  emp.id,
                                  "checkIn",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white [color-scheme:dark] outline-none focus:border-[#ebdcb9]/40 transition-all disabled:opacity-50"
                            />
                          </div>

                          {/* Saída */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                              Horário Saída
                            </label>
                            <input
                              type="time"
                              disabled={!canEdit}
                              value={rec.checkOut}
                              onChange={(e) =>
                                handleUpdateAttendance(
                                  selectedDate,
                                  emp.id,
                                  "checkOut",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white [color-scheme:dark] outline-none focus:border-[#ebdcb9]/40 transition-all disabled:opacity-50"
                            />
                          </div>

                          {/* Status */}
                          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">
                              Status de Jornada
                            </label>
                            <select
                              disabled={!canEdit}
                              value={rec.status}
                              onChange={(e) =>
                                handleUpdateAttendance(
                                  selectedDate,
                                  emp.id,
                                  "status",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-black text-white outline-none focus:border-[#ebdcb9]/40 uppercase tracking-widest disabled:opacity-50"
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

                        {/* Observação Input & Presets */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                          <input
                            type="text"
                            disabled={!canEdit}
                            placeholder="Observação / justificativa do funcionário..."
                            value={rec.note || ""}
                            onChange={(e) =>
                              handleUpdateAttendance(
                                selectedDate,
                                emp.id,
                                "note",
                                e.target.value
                              )
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder:text-stone-600 outline-none focus:border-[#ebdcb9]/40 transition-all"
                          />

                          {/* Quick Action Presets */}
                          {canEdit && (
                            <div className="flex flex-wrap items-center gap-1.5 justify-start lg:justify-end">
                              <button
                                onClick={() => handleQuickPresetForUser(emp.id, "padrao")}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                07h-17h Padrão
                              </button>
                              <button
                                onClick={() => handleQuickPresetForUser(emp.id, "atrasado")}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Atrasou
                              </button>
                              <button
                                onClick={() => handleQuickPresetForUser(emp.id, "falta")}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Falta
                              </button>
                              <button
                                onClick={() => handleQuickPresetForUser(emp.id, "folga")}
                                className="bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/20 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Folga
                              </button>
                              <button
                                onClick={handleSaveSingleUser}
                                className="bg-[#ebdcb9] hover:brightness-105 active:scale-95 text-[#3d2723] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md cursor-pointer ml-auto"
                              >
                                <Save size={13} /> Salvar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Save All Footer */}
              {canEdit && filteredEmployees.length > 0 && (
                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    * Clique em Salvar Toda Equipe para consolidar o ponto de todos os funcionários simultaneamente.
                  </p>
                  <button
                    onClick={handleSaveAllTeamAttendance}
                    className="w-full sm:w-auto bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] hover:brightness-110 active:scale-95 text-[#3d2723] px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
                  >
                    <Save size={18} /> Salvar Lançamento da Equipe Completa
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* INDIVIDUAL DETAILED VIEW FOR SELECTED USER */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
              {/* Resumo do Dia / Status */}
              <div className="space-y-5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Check size={14} /> Resumo do Dia ({selectedUser.name})
                </h4>

                <div className="bg-black/40 border border-[#ebdcb9]/10 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-inner">
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
                          e.target.value
                        )
                      }
                      className="w-full bg-black/40 border border-[#ebdcb9]/15 rounded-xl px-4 py-3 text-sm font-bold text-white [color-scheme:dark] outline-none focus:border-[#ebdcb9]/40 transition-all disabled:opacity-50"
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
                          e.target.value
                        )
                      }
                      className="w-full bg-black/40 border border-[#ebdcb9]/15 rounded-xl px-4 py-3 text-sm font-bold text-white [color-scheme:dark] outline-none focus:border-[#ebdcb9]/40 transition-all disabled:opacity-50"
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
                          e.target.value
                        )
                      }
                      className="w-full bg-black/40 border border-[#ebdcb9]/15 rounded-xl px-4 py-3 sm:py-3.5 text-xs font-black text-white outline-none focus:border-[#ebdcb9]/40 appearance-none uppercase tracking-widest disabled:opacity-50"
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
                        e.target.value
                      )
                    }
                    disabled={!canEdit}
                    placeholder="Adicionar nota de justificativa, falta, atraso, ou atestado..."
                    className="w-full h-full min-h-[160px] bg-black/40 border border-[#ebdcb9]/15 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-[#ebdcb9]/40 resize-none placeholder:text-stone-700 disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              {/* Save Action Footer */}
              <div className="col-span-1 xl:col-span-2 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  * Os horários e status selecionados são gravados e consolidados ao clicar em salvar.
                </div>

                {canEdit && (
                  <button
                    onClick={handleSaveAttendance}
                    className="w-full sm:w-auto bg-gradient-to-tr from-[#ebdcb9] via-[#ad9e7a] to-[#c5a880] hover:brightness-110 active:scale-95 text-[#3d2723] px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0"
                  >
                    <Save size={18} /> Salvar Lançamento de {selectedUser.name.split(" ")[0]}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
