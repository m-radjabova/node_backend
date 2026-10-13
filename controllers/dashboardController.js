import Lead, { leadStatuses } from "../models/Lead.js";
// Oy nomlari
const months = [
  "Yan", "Fev", "Mar", "Apr",
  "May", "Iyn", "Iyl", "Avg",
  "Sen", "Okt", "Noy", "Dek"
];

// Status nomlari
const statusNames = {
  new: "Yangi",
  in_progress: "Jarayonda",
  proposal: "Taklif",
  won: "Yutildi",
  lost: "Yo'qotildi",
};


// MANAGER DASHBOARD
export const getManagerDashboard = async (req, res, next) => {
  try {
    // Tizimga kirgan foydalanuvchi
    const owner = req.user._id;

    // Hozirgi sana
    const now = new Date();

    // Shu oyning boshlanishi
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // O'tgan oyning boshlanishi
    const startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    // Yilning boshlanishi
    const yearStart = new Date(now.getFullYear(), 0, 1);


    // 1. JAMI MIJOZLAR
    const totalClients = await Lead.countDocuments({
      owner,
    });


    // 2. FAOL BITIMLAR
    const activeDeals = await Lead.countDocuments({
      owner,
      status: {
        $in: ["in_progress", "proposal"],
      },
    });


    // 3. OCHIQ VAZIFALAR
    const openTasks = await Lead.countDocuments({
      owner,
      status: {
        $in: ["new", "in_progress"],
      },
    });


    // 4. UMUMIY SOTUVLAR
    const sales = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const salesTotal = sales[0]?.total || 0;


    // 5. SHU OYDAGI SOTUVLAR
    const currentMonthSales = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
          updatedAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const currentSales = currentMonthSales[0]?.total || 0;


    // 6. O'TGAN OYDAGI SOTUVLAR
    const previousMonthSales = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
          updatedAt: {
            $gte: startOfPreviousMonth,
            $lt: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$value" },
        },
      },
    ]);

    const previousSales = previousMonthSales[0]?.total || 0;


    // 7. SOTUVLAR O'ZGARISH FOIZI
    let percentChange = 0;

    if (previousSales > 0) {
      percentChange = Math.round(
        ((currentSales - previousSales) / previousSales) * 100
      );
    } else if (currentSales > 0) {
      percentChange = 100;
    }


    // 8. STATUSLAR BO'YICHA LEADLAR
    const statusGroups = await Lead.aggregate([
      {
        $match: { owner },
      },
      {
        $group: {
          _id: "$status",
          total: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {};

    for (const item of statusGroups) {
      statusMap[item._id] = item.total;
    }

    const leadStatusData = [];

    for (const status of leadStatuses) {
      // Yo'qotilgan leadlarni o'tkazib yuborish
      if (status === "lost") {
        continue;
      }

      const count = statusMap[status] || 0;

      let percent = 0;

      if (totalClients > 0) {
        percent = Math.round(
          (count / totalClients) * 100
        );
      }

      leadStatusData.push({
        name: statusNames[status],
        value: count,
        percent,
      });
    }


    // 9. OXIRGI 4 TA FAOLIYAT
    const recentLeads = await Lead.find({
      owner,
    })
      .sort({ updatedAt: -1 })
      .limit(4)
      .select("name company status updatedAt createdAt");

    const recentActivities = [];

    for (const lead of recentLeads) {
      const companyName = lead.company || lead.name;

      let text = "";

      if (lead.status === "won") {
        text = `Bitim yakunlandi: ${companyName}`;
      } else if (lead.status === "new") {
        text = `Yangi mijoz qo'shildi: ${companyName}`;
      } else {
        text = `${statusNames[lead.status]}: ${companyName}`;
      }

      recentActivities.push({
        id: lead._id,
        text,
        updatedAt: lead.updatedAt,
      });
    }


    // 10. OYLIK SOTUVLAR
    const monthlySalesData = await Lead.aggregate([
      {
        $match: {
          owner,
          status: "won",
          updatedAt: { $gte: yearStart },
        },
      },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          total: { $sum: "$value" },
        },
      },
    ]);

    const monthlySales = [];

    for (let i = 0; i < 12; i++) {
      let total = 0;

      for (const item of monthlySalesData) {
        if (item._id === i + 1) {
          total = item.total;
        }
      }

      monthlySales.push({
        month: months[i],
        total,
      });
    }


    // 11. FRONTENDGA JAVOB QAYTARISH
    return res.status(200).json({
      metrics: {
        totalClients,
        activeDeals,
        salesVolume: salesTotal,
        openTasks,
      },

      changes: {
        totalClients: 0,
        activeDeals: 0,
        salesVolume: percentChange,
        openTasks: 0,
      },

      monthlySales,

      leadStatuses: leadStatusData,

      recentActivities,
    });

  } catch (error) {
    next(error);
  }
};
