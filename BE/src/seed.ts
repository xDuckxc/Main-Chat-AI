import { saveAllStudents } from "./db";

// 🎯 กำหนดชื่อกลุ่ม
const GROUP_NAME = "Linux";

// กำหนดรายชื่อนักศึกษา
export const students = [
  {
    profile: {
      name: "นรินทร์ฤทธิ์ หิรัญอาจ",
      nickname: "คริส",
      bio: `INFP, ชอบทำโมเดล 3D, Unity, Blender, Substance 3D มีความมุ่งมั่นในการผสานงานศิลปะ 3D เข้ากับระบบ Web (สังกัดกลุ่ม: ${GROUP_NAME})`,
      skills: "UX/UI, 3D model, Unity, Blender, Substance 3D, Python, TypeScript, Fullstack",
    },
    // 👉 คนนี้มี 3 โปรเจกต์ (คั่นด้วยคอมมา , ระหว่าง object)
    projects: [
      {
        title: "Little Artist Cat",
        description: "ภาพวาดน้องแมวจิตรกรตัวน้อยกำลังวาดภาพทิวทัศน์สีพาสเทลสุดละมุนในห้องทำงานอบอุ่น",
        tech: "Illustration, Digital Art",
      },
      {
        title: "Animated Fox 3D (GLTF)",
        description: "โมเดลสุนัขจิ้งจอกแบบ Rigged ที่โหลดจากไฟล์ GLB ด้วย GLTFLoader พร้อมอนิเมชัน หมุนชมได้ 360 องศา",
        tech: "Blender, GLTF/GLB, Three.js / Web 3D",
      },
      {
        title: "Torus Knot Dimension",
        description: "โมเดลรูปทรงเรขาคณิตชั้นสูงแบบ Torus Knot เคลือบพื้นผิวเงาวาวแบบ Metallic",
        tech: "3D Modeling, Substance 3D, Web 3D",
      },
    ],
  },
  {
    profile: {
      name: "พงศกร เจิมเจิดพล",
      nickname: "เอ",
      bio: `สาย Frontend ตัวตึง ทำ UI สวยเนี๊ยบ, ชอบทำงานเป็นทีม , เฟรนลี่มากๆ , อะไรที่ไม่ถูกจะบอกตรงๆ (สังกัดกลุ่ม: ${GROUP_NAME})`,
      skills: "concert production, React, python , BullMQ , MinIO, stage drawing, lighting design, live sound engineer, concert systems design, langchain , Rust, Recharts , CanvasJS",
    },
    // 👉 คนนี้มีโปรเจกต์ 2
    projects: [
      {
        title: "E-Commerce Market",
        description: "ระบบร้านค้าออนไลน์ที่ขายModel3D SoundTrack SoundEffect Project complete 100%",
        tech: "Vue.js, Node.js, PostgreSQL,Three.js,MinIO,Rechart,Typescript,TailwindCSS,BullMQ,Stripe,Omise,",
      },
      {
        title: "Webshop-Hosting",
        description: "ระบบ Monorepo  SaaS E-Commerce แบบ Multi-Tenant Project complete 70%",
        tech: "Vue.js, Node.js, PostgreSQL,MinIO,Rechart,Typescript,TailwindCSS,BullMQ,Stripe,Omise,CanvasJS,",
      },
      {
        title: "Stage-Drawing-Design",
        description: "ออกแบบโครงสวร้างเวทีคอนเสริร์ชขนาด 20 เมตร",
        tech: "Capture Visualization",
      },
    ],
  },
  {
    profile: {
      name: "ปิยวัฒน์ ชื่นมีเชาว์",
      nickname: "หมู",
      bio: `สนใจการทำเกมมือถือ, ออกแบบเกมคอม, การทำอนิเมชั่น, เน้นเอนเตอร์เทน (สังกัดกลุ่ม: ${GROUP_NAME})`,
      skills: "Python, FastAPI, Docker, Penetration Testing",
    },
    // 👉 คนนี้มีโปรเจกต์เดียว
    projects: [
      {
        title: "Game Chat App",
        description: "แอปพลิเคชันแชทหาคู่ความปลอดภัยสูง",
        tech: "Python, WebSockets, Docker",
      },
    ],
  },
  {
    profile: {
      name: "อุชุตา ศรีทองสุข",
      nickname: "อุ๊",
      bio: `สนใจด้านการเขียนโปรแกรมและออกแบบ ux/ui (figma) (สังกัดกลุ่ม: ${GROUP_NAME})`,
      skills: "python, html เบื้องต้น",
    },
    // 👉 คนนี้มีโปรเจกต์เดียว
    projects: [
      {
        title: "โปรเจกต์ Chat AI พร้อม Portfolio ของกลุ่ม linux",
        description: "พัฒนา Front-end เว็บไซต์ Chat AI และ Portfolio ด้วย Figma, HTML, CSS, JS",
        tech: "figma, html, css, js",
      },
    ],
  },
  {
    profile: {
      name: "มนัสชนก สิมบุตร",
      nickname: "ไอซ์",
      bio: `สนใจในการทำchat bot คอมพิวเตอร์วิชั่น เเละการทำเว็บดีไซน์ (สังกัดกลุ่ม: ${GROUP_NAME})`,
      skills: "python,c++, html,css,SQL",
    },
    // 👉 คนนี้มีโปรเจกต์เดียว
    projects: [
      {
        title: "Mini Chat",
        description: "เว็บแชตกับบอท ต่อ Gemini API",
        tech: "React, TypeScript, Express",
      },
    ],
  },
];

export function runSeed(): void {
  saveAllStudents(students);
  console.log(`✅ บันทึกข้อมูลนักศึกษา ${students.length} คน (กลุ่ม: ${GROUP_NAME}) เรียบร้อยแล้ว!`);
}

// เมื่อรันไฟล์นี้โดยตรง (npm run seed): บันทึกข้อมูนทันที
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  runSeed();
}