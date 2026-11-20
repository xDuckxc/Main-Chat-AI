import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  createdAt?: string;
}

const DB_FILE = process.env.DB_PATH || path.join(__dirname, "..", "chat.db");

const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const toMessage = (r: Record<string, unknown>): Message => ({
  id: Number(r.id),
  role: r.role as Message["role"],
  text: String(r.text),
  createdAt: r.created_at ? String(r.created_at) : undefined,
});

const qAll = db.prepare("SELECT id, role, text, created_at FROM messages ORDER BY id");
const qRecent = db.prepare(
  "SELECT id, role, text, created_at FROM messages ORDER BY id DESC LIMIT ?",
);
const qGet = db.prepare("SELECT id, role, text, created_at FROM messages WHERE id = ?");
const qInsert = db.prepare("INSERT INTO messages (role, text) VALUES (?, ?)");
const qUpdate = db.prepare("UPDATE messages SET text = ? WHERE id = ?");
const qDelete = db.prepare("DELETE FROM messages WHERE id = ?");
const qClear = db.prepare("DELETE FROM messages");

export function listMessages(): Message[] {
  return qAll.all().map(toMessage);
}

export function recentMessages(n: number): Message[] {
  return qRecent.all(n).map(toMessage).reverse();
}

export function addPair(
  userText: string,
  assistantText: string,
): [Message, Message] {
  db.exec("BEGIN");
  try {
    const u = qInsert.run("user", userText);
    const a = qInsert.run("assistant", assistantText);
    db.exec("COMMIT");
    return [
      toMessage(qGet.get(Number(u.lastInsertRowid)) as Record<string, unknown>),
      toMessage(qGet.get(Number(a.lastInsertRowid)) as Record<string, unknown>),
    ];
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

export function updateMessage(id: number, text: string): Message | null {
  if (qUpdate.run(text, id).changes === 0) return null;
  return toMessage(qGet.get(id) as Record<string, unknown>);
}

export function deleteMessage(id: number): boolean {
  return qDelete.run(id).changes > 0;
}

export function clearMessages(): void {
  qClear.run();
}

// ===== ข้อมูล portfolio ของเรา (ให้บอทใช้ตอบ) =====
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name   TEXT NOT NULL,
    nickname TEXT NOT NULL DEFAULT '',
    bio    TEXT NOT NULL,
    skills TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id  INTEGER NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    tech        TEXT NOT NULL,
    FOREIGN KEY(profile_id) REFERENCES profile(id)
  );
`);

// เพิ่ม migration สำหรับฐานข้อมูลเก่า: ถ้าตาราง profile มีอยู่แล้วแต่ขาดคอลังก์
// nickname (CREATE TABLE IF NOT EXISTS ไม่สามารถเพิ่มคอลังก์ให้ตารางเก่าได้)
const hasNickname = db
  .prepare("SELECT name FROM pragma_table_info('profile') WHERE name = 'nickname'")
  .get() as { name: string } | undefined;
if (!hasNickname) {
  db.exec("ALTER TABLE profile ADD COLUMN nickname TEXT NOT NULL DEFAULT ''");
}

export interface ProfileRow {
  name: string;
  nickname: string;
  bio: string;
  skills: string;
}

export interface ProjectRow {
  title: string;
  description: string;
  tech: string;
}

// รวมข้อมูล portfolio จาก SQLite เป็นข้อความเดียว ไว้ใส่ใน system prompt
export function getPortfolioContext(): string {
  const profiles = db.prepare("SELECT id, name, nickname, bio, skills FROM profile").all() as any[];
  if (profiles.length === 0) return "(ยังไม่มีข้อมูล portfolio)";

  const lines: string[] = [];
  for (const profile of profiles) {
    const projects = db.prepare("SELECT title, description, tech FROM projects WHERE profile_id = ?").all(profile.id) as any[];
    
    lines.push(`--- นักศึกษา: ${profile.name} ---`);
    lines.push(`ชื่อ: ${profile.name}`);
    lines.push(`ชื่อเล่น: ${profile.nickname}`);
    lines.push(`แนะนำตัว: ${profile.bio}`);
    lines.push(`ทักษะ: ${profile.skills}`);
    lines.push("โปรเจกต์:");
    projects.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.title} — ${p.description} (เทคโนโลยี: ${p.tech})`);
    });
    lines.push("");
  }
  return lines.join("\n");
}

// --- 3. ฟังก์ชันบันทึกข้อมูลนักศึกษาหลายคนพร้อมกัน (ใช้ตอนรัน seed) ---
export interface StudentData {
  profile: { name: string; nickname: string; bio: string; skills: string };
  projects: { title: string; description: string; tech: string }[];
}

// ตรวจสอบว่าตาราง profile ยังไม่มีรายการ (เช่น chat.db ใหม่ที่ยังไม่ได้ seed)
export function portfolioIsEmpty(): boolean {
  try {
    const row = db.prepare("SELECT COUNT(*) AS cnt FROM profile").get() as
      | { cnt: number }
      | undefined;
    return !row || (row.cnt ?? 0) === 0;
  } catch {
    return true;
  }
}

export function saveAllStudents(students: StudentData[]): void {
  db.exec("BEGIN");
  try {
    // ล้างข้อมูลเก่าทิ้งก่อน เพื่อใส่ชุดใหม่ที่อัปเดตแล้ว
    db.exec("DELETE FROM projects");
    db.exec("DELETE FROM profile");

    const insertProfile = db.prepare(
      "INSERT INTO profile (name, nickname, bio, skills) VALUES (?, ?, ?, ?)"
    );
    const insertProject = db.prepare(
      "INSERT INTO projects (profile_id, title, description, tech) VALUES (?, ?, ?, ?)"
    );

    for (const student of students) {
      const res = insertProfile.run(
        student.profile.name,
        student.profile.nickname,
        student.profile.bio,
        student.profile.skills
      );
      const profileId = res.lastInsertRowid; // ดึง ID ที่เพิ่งถูกสร้างอัตโนมัติ

      for (const p of student.projects) {
        insertProject.run(profileId, p.title, p.description, p.tech);
      }
    }

    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}