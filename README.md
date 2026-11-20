1. Fork โปรเจกต์ไปไว้ใน Github ของตัวเอง แล้วตั้ง 
2. Clone จาก fork ของตัวเอง

git clone 
cd Main-Chat-AI

3. สร้าง `BE/.env` copy code จาก `BE/.env.example` และใส่ `LLM_API_KEY`

4. docker-compose build — ติดตั้ง dependency ทั้ง FE และ BE ใน Dockerfile อัตโนมัติ (`RUN npm ci` ของ BE และ `RUN npm install` ของ FE) โดยไม่ต้อง `npm install` บนโฮสต์


หน้า Home, หน้าสมาชิก และโมเดล 3D ใช้ข้อมูลฝั่ง FE จึงเปิดได้ไม่ต้องรัน BE — เฉพาะหน้า CHAT AI ที่ต้องรัน BE

| BE | `npm run dev` | รัน BE (restart เองเมื่อแก้ไฟล์) |
| BE | `npm run check` | ตรวจ TypeScript |
| BE | `npm run seed` | seed ข้อมูลลง SQLite |
| FE | `npm run dev` | รัน Vite dev server |
| FE | `npm run typecheck` | ตรวจ TypeScript ฝั่ง FE |
| FE | `npm run build` | build production |

ระวัง: `docker-compose.yml` mount เฉพาะ `FE/src`, `FE/public`, `FE/index.html` และ `FE/vite.config.ts` — **ไม่ได้ mount `package.json`** ดังนั้นถ้าเพิ่ม dependency ใหม่ (เช่น `three`) ต้อง `docker compose build fe` ใหม่ และถ้าเพิ่มไฟล์ใหม่ลง `public/` หลัง Vite start ต้อง restart container FE ด้วย

สร้าง `BE/.env` ก่อน แล้ว:

```bash
docker compose up --build
```

## รันบน Vercel

### Vercel — ใช้งานเต็มฟีเจอร์ (CHAT AI ต้องมี BE บน Vercel)
- เชื่อม GitHub เข้ากับ [Vercel](https://vercel.com/dashboard) → Import Project — Vercel build ทั้งสอง services จาก `vercel.json`:
  - **`fe`** (root `FE/`, runtime container, entrypoint `Dockerfile`) — nginx แสดง Home / MEMBERS / CHAT PAGE (static จาก `FE/dist`)
  - **`be`** (root `BE/`, runtime container, entrypoint `Dockerfile`) — Express API + SQLite (พอร์ท 3000)
- `/messages` และ `/status` ถูก rewrite ไปยัง service `be` โดยอัตโนมัติ — Home / MEMBERS / CHAT PAGE ทำงานปกติ และหน้า CHAT AI จะเชื่อมกับ BE ได้เลย
- ตั้งค่า env ใน Vercel Dashboard: `LLM_API_KEY` (ตาม `BE/.env.example` เพื่อใช้หน้า CHAT AI), `LLM_MODEL` (optional)
