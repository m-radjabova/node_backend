import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import ensureDefaultAdmin from "./config/admin.js";
import User from "./models/User.js";
import Lead from "./models/Lead.js";
import Company from "./models/Company.js";
import Task from "./models/Task.js";

const demoPassword = "Manager123!";

const demoUsers = [
  {
    fullName: "Azizbek Karimov",
    email: "azizbek.manager@crm.local",
    role: "manager",
    jobTitle: "Sales Manager",
    company: "CRM Pro",
  },
  {
    fullName: "Malika Sodiqova",
    email: "malika.manager@crm.local",
    role: "manager",
    jobTitle: "Account Manager",
    company: "CRM Pro",
  },
  {
    fullName: "Jasur Rahimov",
    email: "jasur.manager@crm.local",
    role: "manager",
    jobTitle: "Business Manager",
    company: "CRM Pro",
  },
  {
    fullName: "Ali Valiyev",
    email: "ali.user@crm.local",
    role: "manager",
    jobTitle: "Client Success Manager",
    company: "CRM Pro",
  },
  {
    fullName: "Dilshod Ergashev",
    email: "dilshod.user@crm.local",
    role: "manager",
    jobTitle: "Regional Sales Manager",
    company: "CRM Pro",
  },
];

const minimumLeadsPerManager = 10;
const demoTaskTemplates = [
  { title: "Demo uchrashuvga tayyorgarlik", description: "Mijoz ehtiyojlari va taklifni ko'rib chiqing.", status: "in_progress", priority: "high", days: 0 },
  { title: "Tijoriy taklif yuborish", description: "Tasdiqlangan taklifni email orqali jo'nating.", status: "todo", priority: "high", days: 1 },
  { title: "Follow-up qo'ng'iroq", description: "Taklif bo'yicha mijoz fikrini aniqlang.", status: "todo", priority: "medium", days: 2 },
  { title: "Mijoz talablari tahlili", description: "Keyingi uchrashuv uchun talablarni yig'ing.", status: "todo", priority: "medium", days: 4 },
  { title: "Shartnoma hujjatlarini tekshirish", description: "Yuridik va tijoriy bandlarni tekshiring.", status: "done", priority: "low", days: -1 },
  { title: "Oylik savdo hisobotini tayyorlash", description: "Faol leadlar bo'yicha qisqa hisobot yarating.", status: "todo", priority: "low", days: 7 },
];

const leadTemplates = [
  ["Uzum Market", 9200, "Marketplace savdo jarayonlarini avtomatlashtirish"],
  ["Click", 7800, "Mijozlar bilan ishlash tizimini yangilash"],
  ["Kapitalbank", 14500, "Korporativ mijozlar uchun CRM integratsiyasi"],
  ["Akfa Group", 11000, "Savdo bo‘limlari uchun yagona CRM tizimi"],
  ["Texnomart", 6400, "Retail mijozlar bazasini boshqarish"],
  ["Express24", 5900, "Hamkorlar bilan ishlash jarayonini optimallashtirish"],
  ["Anorbank", 12800, "Raqamli sotuv voronkasini joriy etish"],
  ["Najot Ta'lim", 4200, "Korporativ mijozlar hisobini avtomatlashtirish"],
  ["Makro", 8600, "Loyal mijozlar bilan ishlash platformasi"],
  ["Humans", 9700, "Sotuv va qo‘llab-quvvatlash jarayonlarini birlashtirish"],
  ["Asaxiy", 6800, "Onlayn savdo leadlarini boshqarish"],
  ["Hamkorbank", 13200, "Filiallar uchun CRM yechimini joriy etish"],
  ["EVOS", 5100, "Franshiza hamkorlari bilan ishlash tizimi"],
  ["Coca-Cola Uzbekistan", 15600, "Distribyutorlar savdosini avtomatlashtirish"],
  ["Qanot Sharq", 7300, "Korporativ mijozlar savdo tizimini rivojlantirish"],
];

const leadStatuses = ["new", "in_progress", "proposal", "won", "lost"];

const demoCompanies = [
  {
    name: "Afka Group",
    industry: "IT xizmatlari",
    description: "CRM va biznes jarayonlarini avtomatlashtirish bo‘yicha hamkor.",
    contactName: "Azizbek Karimov",
    contactEmail: "azizbek@afka.uz",
    contactPhone: "+998 90 123 45 67",
    website: "https://afka.uz",
    status: "active",
  },
  {
    name: "IT Park Uzbekistan",
    industry: "Davlat va IT",
    description: "Texnologik loyihalar va startaplar ekotizimi.",
    contactName: "Malika Sodiqova",
    contactEmail: "malika@itpark.uz",
    contactPhone: "+998 90 222 33 44",
    website: "https://it-park.uz",
    status: "active",
  },
  {
    name: "Ucell",
    industry: "Telekommunikatsiya",
    description: "Korporativ aloqa va mijozlar bilan ishlash loyihasi.",
    contactName: "Jasur Rahimov",
    contactEmail: "jasur@ucell.uz",
    contactPhone: "+998 90 333 44 55",
    website: "https://ucell.uz",
    status: "prospect",
  },
  {
    name: "Google Uzbekistan",
    industry: "IT va texnologiyalar",
    description: "Raqamli mahsulotlar va savdo tahlili bo‘yicha hamkorlik.",
    contactName: "Dilshod Ergashev",
    contactEmail: "dilshod@google.com",
    contactPhone: "+998 90 444 55 66",
    website: "https://google.com",
    status: "active",
  },
  {
    name: "Artel",
    industry: "Ishlab chiqarish",
    description: "Maishiy texnika savdosi uchun CRM integratsiyasi.",
    contactName: "Kamila Rasulova",
    contactEmail: "kamila@artel.uz",
    contactPhone: "+998 90 555 66 77",
    website: "https://artel.uz",
    status: "active",
  },
  {
    name: "Payme",
    industry: "Moliyaviy xizmatlar",
    description: "To‘lov xizmatlari mijozlari bilan ishlash jarayonlari.",
    contactName: "Sardor Botirov",
    contactEmail: "sardor@payme.uz",
    contactPhone: "+998 90 666 77 88",
    website: "https://payme.uz",
    status: "prospect",
  },
  {
    name: "Beeline Uzbekistan",
    industry: "Telekommunikatsiya",
    description: "Korporativ abonentlar bo‘yicha savdo hamkori.",
    contactName: "Nodirbek Aliyev",
    contactEmail: "nodirbek@beeline.uz",
    contactPhone: "+998 90 777 88 99",
    website: "https://beeline.uz",
    status: "inactive",
  },
  {
    name: "UzAuto Motors",
    industry: "Avtomobil sanoati",
    description: "Dilerlar va korporativ mijozlarni boshqarish loyihasi.",
    contactName: "Madina Umarova",
    contactEmail: "madina@uzauto.uz",
    contactPhone: "+998 90 888 99 00",
    website: "https://uzautomotors.com",
    status: "active",
  },
  {
    name: "TBC Bank Uzbekistan",
    industry: "Bank va moliya",
    description: "Raqamli bank xizmatlari uchun potensial hamkor.",
    contactName: "Kamron Mirzayev",
    contactEmail: "kamron@tbcbank.uz",
    contactPhone: "+998 90 999 00 11",
    website: "https://tbcbank.uz",
    status: "prospect",
  },
  {
    name: "Makro",
    industry: "Retail savdo",
    description: "Loyallik dasturi va mijozlar bazasini boshqarish.",
    contactName: "Shahnoza Qodirova",
    contactEmail: "shahnoza@makro.uz",
    contactPhone: "+998 91 111 22 33",
    website: "https://makro.uz",
    status: "active",
  },
];

const makeLead = (template, managerIndex, leadIndex) => {
  const [company, value, description] = template;
  const sequence = managerIndex * leadTemplates.length + leadIndex + 1;

  return {
    name: `${company} CRM loyihasi`,
    company,
    description,
    value: value + managerIndex * 350,
    status: leadStatuses[(managerIndex + leadIndex) % leadStatuses.length],
    contactName: `Kontakt ${sequence}`,
    contactEmail: `contact${sequence}@example.uz`,
    contactPhone: `+99890${String(1000000 + sequence).slice(-7)}`,
  };
};

const leadsByManager = {
  "azizbek.manager@crm.local": [
    {
      name: "Afka Group",
      company: "Afka Group",
      description: "CRM va xizmatlar bo‘yicha hamkorlik",
      value: 5000,
      status: "new",
      contactName: "Azizbek Karimov",
      contactEmail: "azizbek@afka.uz",
      contactPhone: "+998901234567",
    },
    {
      name: "IT Park",
      company: "IT Park",
      description: "Korxona CRM avtomatlashtirish loyihasi",
      value: 6000,
      status: "in_progress",
      contactName: "Malika Sodiqova",
      contactEmail: "malika@itpark.uz",
      contactPhone: "+998902223344",
    },
    {
      name: "Ucell",
      company: "Ucell",
      description: "Yangi mijozlar bilan ishlash jarayoni",
      value: 10000,
      status: "proposal",
      contactName: "Jasur Rahimov",
      contactEmail: "jasur@ucell.uz",
      contactPhone: "+998903334455",
    },
    {
      name: "Google Uzbekistan",
      company: "Google",
      description: "Muvaffaqiyatli yakunlangan hamkorlik",
      value: 15000,
      status: "won",
      contactName: "Dilshod Ergashev",
      contactEmail: "dilshod@gmail.com",
      contactPhone: "+998904445566",
    },
  ],
  "malika.manager@crm.local": [
    {
      name: "Artel",
      company: "Artel",
      description: "Savdo bo‘limi uchun CRM integratsiyasi",
      value: 3000,
      status: "new",
      contactName: "Kamila Rasulova",
      contactEmail: "kamila@artel.uz",
      contactPhone: "+998905556677",
    },
    {
      name: "Payme",
      company: "Payme",
      description: "Mijoz tajribasini yaxshilash loyihasi",
      value: 4500,
      status: "in_progress",
      contactName: "Sardor Botirov",
      contactEmail: "sardor@payme.uz",
      contactPhone: "+998906667788",
    },
    {
      name: "Beeline",
      company: "Beeline",
      description: "Tijoriy taklif yuborilgan",
      value: 6500,
      status: "proposal",
      contactName: "Nodirbek Aliyev",
      contactEmail: "nodirbek@beeline.uz",
      contactPhone: "+998907778899",
    },
  ],
  "jasur.manager@crm.local": [
    {
      name: "UzAuto Motors",
      company: "UzAuto Motors",
      description: "Mijozlar oqimini boshqarish tizimi",
      value: 7000,
      status: "new",
      contactName: "Madina Umarova",
      contactEmail: "madina@uzauto.uz",
      contactPhone: "+998908889900",
    },
    {
      name: "TBC Bank",
      company: "TBC Bank",
      description: "Yangi bank CRM yechimi",
      value: 8000,
      status: "in_progress",
      contactName: "Kamron Mirzayev",
      contactEmail: "kamron@tbc.uz",
      contactPhone: "+998909990011",
    },
  ],
};

const ensureUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email });
  if (existing) {
    let changed = false;
    for (const field of ["fullName", "role", "jobTitle", "company"]) {
      if (existing[field] !== userData[field]) {
        existing[field] = userData[field];
        changed = true;
      }
    }
    if (changed) await existing.save();
    return { user: existing, created: false, updated: changed };
  }

  const user = await User.create({
    ...userData,
    passwordHash: await bcrypt.hash(demoPassword, 12),
  });
  return { user, created: true, updated: false };
};

const seed = async () => {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    let usersCreated = 0;
    let usersUpdated = 0;
    let leadsCreated = 0;
    let companiesCreated = 0;
    let tasksCreated = 0;
    const managers = new Map();

    for (const userData of demoUsers) {
      const { user, created, updated } = await ensureUser(userData);
      if (created) usersCreated += 1;
      if (updated) usersUpdated += 1;
      if (user.role === "manager") managers.set(user.email, user);
    }

    for (const [email, leadList] of Object.entries(leadsByManager)) {
      const manager = managers.get(email) || (await User.findOne({ email }));
      if (!manager) continue;

      for (const leadData of leadList) {
        const exists = await Lead.exists({ owner: manager._id, name: leadData.name });
        if (!exists) {
          await Lead.create({ ...leadData, owner: manager._id });
          leadsCreated += 1;
        }
      }
    }

    for (const manager of managers.values()) {
      for (const companyData of demoCompanies) {
        const exists = await Company.exists({ owner: manager._id, name: companyData.name });
        if (exists) continue;

        await Company.create({ ...companyData, owner: manager._id });
        companiesCreated += 1;
      }
    }

    const managerSummary = [];
    let managerIndex = 0;

    for (const manager of managers.values()) {
      let totalLeads = await Lead.countDocuments({ owner: manager._id });

      for (let leadIndex = 0; totalLeads < minimumLeadsPerManager && leadIndex < leadTemplates.length; leadIndex += 1) {
        const leadData = makeLead(leadTemplates[leadIndex], managerIndex, leadIndex);
        const exists = await Lead.exists({ owner: manager._id, name: leadData.name });
        if (exists) continue;

        await Lead.create({ ...leadData, owner: manager._id });
        leadsCreated += 1;
        totalLeads += 1;
      }

      if (totalLeads < minimumLeadsPerManager) {
        throw new Error(`${manager.email} uchun ${minimumLeadsPerManager} ta lead yaratib bo‘lmadi`);
      }

      managerSummary.push(`${manager.email}: ${totalLeads} ta lead`);

      const managerLeads = await Lead.find({ owner: manager._id })
        .sort({ createdAt: 1 })
        .select("_id")
        .limit(demoTaskTemplates.length);

      for (const [taskIndex, template] of demoTaskTemplates.entries()) {
        const title = `${template.title} #${taskIndex + 1}`;
        const exists = await Task.exists({ owner: manager._id, title });
        if (exists) continue;

        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + template.days);
        dueAt.setHours(9 + taskIndex, 0, 0, 0);
        await Task.create({
          title,
          description: template.description,
          status: template.status,
          priority: template.priority,
          dueAt,
          lead: managerLeads[taskIndex % managerLeads.length]?._id || null,
          owner: manager._id,
        });
        tasksCreated += 1;
      }
      managerIndex += 1;
    }

    console.log(
      `Seed yakunlandi: ${usersCreated} user yaratildi, ${usersUpdated} user yangilandi, ${leadsCreated} lead, ${companiesCreated} kompaniya va ${tasksCreated} vazifa qo‘shildi.`,
    );
    managerSummary.forEach((summary) => console.log(`- ${summary}`));
    console.log(`Demo manager paroli: ${demoPassword}`);
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error) => {
  console.error(`Seed xatosi: ${error.message}`);
  process.exitCode = 1;
});

